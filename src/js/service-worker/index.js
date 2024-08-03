import {fetchFromChromeStorage} from "../utils/utils.js"


chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
    const {type} = obj;

    if (type === "QUICKPACK-ADD-UNITS-PACKED") {

        const currentPickTask = {
            type: obj.pickTaskIdentifier,
            quantity: obj.quantity,
        };

        const currentDateAndTime =  new Date();
        const todayDate = currentDateAndTime.toLocaleDateString("en-US");
        const currentTime = ('0' + currentDateAndTime.getHours()).slice(-2) + ":" +('0' + currentDateAndTime.getMinutes()).slice(-2);

        addToPreviouslyPacked(todayDate, currentPickTask);
        
        addToLifeTimePacked(currentPickTask);

        const newLog = createNewLog(currentTime, "QUICK PACK ADDED", currentPickTask.quantity + " " + currentPickTask.type + " added to total");

        saveLog(todayDate, newLog);

    } else if (type === "RESET-ALL-RECORDS") {
        clearAllRecords().then(response => {
            sendResponse(response);
        })

        
    } else if (type === "ADJUST-RECENT-RECORDS") {
        editRecords(obj.AdjustmentType, obj.OrderType, obj.quantity).then(response => {
            sendResponse(response);
        })
    } else if (type === "ADD-PICK-TASK-QUANTITY-TO-TOTAL" && obj.pickTaskIdentifier) {
        fetch("https://dropship.amazon.com/web/ajax/search/getItemsById?id="+obj.pickTaskIdentifier)
        .then((response) => {
            if  (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        })
        .then((data) => {

            const pickTaskInfo = data.items.PickTask[0];

            if (!pickTaskInfo) {
                return Promise.reject(data);
            }

            const pickTaskQuantity = pickTaskInfo.totalQuantity;
            let pickTaskType = "MULTI";

            for (let attribute of pickTaskInfo.attributes) {
                let {attributeValue, attributeName} = attribute;

                if (attributeName === "sioc" && attributeValue === "true") {
                    pickTaskType = "SIOC";
                    break;
                } else if (attributeName === "single" && attributeValue === "true") {
                    pickTaskType = "SINGLE";
                }
            }

            const currentPickTask = {
                type: pickTaskType,
                quantity: pickTaskQuantity, 
            };
    
            const currentDateAndTime =  new Date();
            const todayDate = currentDateAndTime.toLocaleDateString("en-US");
            const currentTime = ('0' + currentDateAndTime.getHours()).slice(-2) + ":" +('0' + currentDateAndTime.getMinutes()).slice(-2);
    
            addToPreviouslyPacked(todayDate, currentPickTask);
            
            addToLifeTimePacked(currentPickTask);
    
            const newLog = createNewLog(currentTime, "PICK TASK TOTAL ADDED", currentPickTask.quantity + " " + currentPickTask.type + " added to total");
    
            saveLog(todayDate, newLog);

        })
        .catch((response) => {
            const currentDateAndTime =  new Date();
            const todayDate = currentDateAndTime.toLocaleDateString("en-US");
            const currentTime = ('0' + currentDateAndTime.getHours()).slice(-2) + ":" +('0' + currentDateAndTime.getMinutes()).slice(-2);

            const newLog = createNewLog(currentTime, "ERROR", "Error Identifying Pick Task");
    
            saveLog(todayDate, newLog);
        })
        .catch((error) => {
            console.log(error);
        })
    }

    return true;
    
});






const editRecords = async (typeOfEdit, typeOfOrderToEdit, amountToEdit) => {
    const allowedTypes = ["ADD", "REMOVE"];
    const allowedOrderTypes = ["SIOC", "SINGLE", "MULTI"];
    let response = {state: "FAIL", message: "Invalid Request"};

    if (allowedTypes.includes(typeOfEdit) && allowedOrderTypes.includes(typeOfOrderToEdit) && (typeof amountToEdit) === 'number') {

        const currentDateAndTime =  new Date();
        const todayDate = currentDateAndTime.toLocaleDateString("en-US");
        const currentTime = ('0' + currentDateAndTime.getHours()).slice(-2) + ":" +('0' + currentDateAndTime.getMinutes()).slice(-2);

        if (typeOfEdit === "ADD") {

            const adjustment = {
                type: typeOfOrderToEdit,
                quantity: amountToEdit,
            };

            await addToPreviouslyPacked(todayDate, adjustment);
        
            await addToLifeTimePacked(adjustment);

            const newLog = createNewLog(currentTime, "RECORD ADJUSTMENT", amountToEdit + " " + typeOfOrderToEdit + " add to total");

            await saveLog(todayDate, newLog);

            response = {state: "SUCCESS", message: "Successfully Adjusted Records"};

        } else if (typeOfEdit === "REMOVE") {
            
            const recentlyPacked = formateRecentlyPacked(await fetchFromChromeStorage("RECENTLY-PACKED", []), todayDate);

            if (recentlyPacked[recentlyPacked.length-1][typeOfOrderToEdit] >= amountToEdit) {

                const adjustment = {
                    type: typeOfOrderToEdit,
                    quantity: -amountToEdit,
                };

                await addToPreviouslyPacked(todayDate, adjustment);
        
                await addToLifeTimePacked(adjustment);

                const newLog = createNewLog(currentTime, "RECORD ADJUSTMENT", amountToEdit + " " + typeOfOrderToEdit + " removed from total");

                await saveLog(todayDate, newLog);

                response = {state: "SUCCESS", message: "Successfully Adjusted Records"};

            } else {
                response = {state: "FAIL", message: "Invalid Request, amount to remove greater then currently packed"};
            }

        }

    }

    return response;

};




const clearAllRecords = async () => {

    const currentDateAndTime =  new Date();
    const todayDate = currentDateAndTime.toLocaleDateString("en-US");
    const currentTime = ('0' + currentDateAndTime.getHours()).slice(-2) + ":" +('0' + currentDateAndTime.getMinutes()).slice(-2);

    let desc = "Records Successfully Reset";
    let type = "RESET";
    let currentSate = "SUCCESS";

    chrome.storage.sync.remove(["LIFETIME-PACKED", "RECENTLY-PACKED", "TODAYS-FAASTPLUS-LOGS"], function(){
        var error = chrome.runtime.lastError;
        if (error) {
          desc = "Reset Failed!";
          type = "ERROR";
          currentSate = "FAIL";
        }
    });

    const newLog = createNewLog(currentTime, type, desc);

    await saveLog(todayDate, newLog);

    return {state: currentSate, message: desc};

}



const createNewLog = (timeOfLog, typeOfLog, descriptionOfLog) => {
    return {
        time: timeOfLog,
        type: typeOfLog,
        desc: descriptionOfLog,
    };
};



const saveLog = async (todaysDate, newLog) => {
    let currentLogs = await fetchFromChromeStorage("TODAYS-FAASTPLUS-LOGS", {});

    if (currentLogs.date != todaysDate) {
        currentLogs = {
            date: todaysDate,
            logs: [],
        };
    };

    currentLogs.logs.push(newLog);

    chrome.storage.sync.set({
        ["TODAYS-FAASTPLUS-LOGS"]: JSON.stringify(currentLogs)
    });
};





const formateRecentlyPacked = (data, todayDate) => {
    if ((!data[0]) || data[data.length-1]["date"] != todayDate) {
        data.push({
            date: todayDate,
            SIOC: 0,
            MULTI: 0,
            SINGLE: 0,
        })
    };

    while (data.length > 2) {
        data.shift();
    };

    return data;
};




const addToPreviouslyPacked = async (date, order) => {
    let recentlyPacked = formateRecentlyPacked(await fetchFromChromeStorage("RECENTLY-PACKED", []), date);
    recentlyPacked[recentlyPacked.length-1][order.type] += order.quantity;
    
    chrome.storage.sync.set({
        ["RECENTLY-PACKED"]: JSON.stringify(recentlyPacked)
    });
};




const addToLifeTimePacked = async (order) => {
    let lifeTimePacked = await fetchFromChromeStorage("LIFETIME-PACKED", {SIOC: 0, MULTI: 0, SINGLE: 0});
    lifeTimePacked[order.type] += order.quantity;

    chrome.storage.sync.set({
        ["LIFETIME-PACKED"]: JSON.stringify(lifeTimePacked)
    });
};


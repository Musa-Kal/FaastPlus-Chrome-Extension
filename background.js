chrome.tabs.onUpdated.addListener((tabId) => {

    chrome.tabs.get(tabId, (tab) => {
        
        if (tab.url.includes("dropship.amazon.com/web/pack/packBulk/picktask")) {
            chrome.tabs.sendMessage(tabId, {
                type: "NEWORDER",
            });
        } else if (tab.url.includes("dropship.amazon.com/web/picktasks/new")) {
            chrome.tabs.sendMessage(tabId, {
                type: "DISPLAY-PRODUCT-IMAGE",
            });
        } else if (tab.url.includes("dropship.amazon.com/web/picktasks")) {
            chrome.tabs.sendMessage(tabId, {
                type: "COUNTPICKTASK",
            });
        } else if (tab.url.includes("dropship.amazon.com/mobile/pack/printDocumentsForBulk?printServerName=")) {
            chrome.tabs.sendMessage(tabId, {
                type: "DISPLAY-QUICKPACK-PROMPT",
            });
        }
        
    });
    
});




let currentLabel = undefined;
chrome.tabs.onActivated.addListener( ({tabId}) => {
        if (tabId) {
            chrome.tabs.get(tabId, (tab) => {
                if (tab.url.includes("dropship.amazon.com/web/pack/packBulk/picktask")) {
                    chrome.tabs.sendMessage(tabId, {
                        type: "COUNTUNITS",
                    });
                }
            })
        }
});




chrome.runtime.onMessage.addListener(async (obj, sender, response) => {
    const {type} = obj;

    if (type === "SET-CURRET-ORDER") {

        currentLabel = {
            type: obj.typeOfOrder,
            quantity: obj.quantity,
        };

    } else if (type === "QUICKPACK-ADD-UNITS-PACKED") {

        const currentPickTask = {
            type: obj.pickTaskType,
            quantity: obj.quantity,
        };

        const currentDateAndTime =  new Date();
        const todayDate = currentDateAndTime.toLocaleDateString("en-US");
        const currentTime = ('0' + currentDateAndTime.getHours()).slice(-2) + ":" +('0' + currentDateAndTime.getMinutes()).slice(-2);

        await addToPreviouslyPacked(todayDate, currentPickTask);
        
        await addToLifeTimePacked(currentPickTask);

        const newLog = createNewLog(currentTime, "QUICK PACK ADDED", currentPickTask.quantity + " " + currentPickTask.type + " added to total");

        await saveLog(todayDate, newLog);

    } else if (type === "RESET-ALL-RECORDS") {
        await clearAllRecords();
    }
    
});


const clearAllRecords = async () => {

    const currentDateAndTime =  new Date();
    const todayDate = currentDateAndTime.toLocaleDateString("en-US");
    const currentTime = ('0' + currentDateAndTime.getHours()).slice(-2) + ":" +('0' + currentDateAndTime.getMinutes()).slice(-2);

    let desc = "Records Successfully Reset";
    let type = "RESET";

    chrome.storage.sync.remove(["LIFETIME-PACKED", "RECENTLY-PACKED", "TODAYS-FAASTPLUS-LOGS"], function(){
        var error = chrome.runtime.lastError;
        if (error) {
          desc = "Reset Failed!";
          type = "ERROR";
        }
    });

    const newLog = createNewLog(currentTime, type, desc);

    await saveLog(todayDate, newLog);

}



const createNewLog = (timeOfLog, typeOfLog, descriptionOfLog) => {
    return {
        time: timeOfLog,
        type: typeOfLog,
        desc: descriptionOfLog,
    };
};



const saveLog = async (todaysDate, newLog) => {
    let currerntLogs = await fetchFromChromeStorage("TODAYS-FAASTPLUS-LOGS", {});

    if (currerntLogs.date != todaysDate) {
        currerntLogs = {
            date: todaysDate,
            logs: [],
        };
    };

    currerntLogs.logs.push(newLog);

    chrome.storage.sync.set({
        ["TODAYS-FAASTPLUS-LOGS"]: JSON.stringify(currerntLogs)
    });
};



const fetchFromChromeStorage = async (key, defaultResponse=[]) => {
    return new Promise((resolve) => {
        chrome.storage.sync.get([key], (obj) => {
            resolve(obj[key] ? JSON.parse(obj[key]) : defaultResponse);
        });
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




chrome.webRequest.onBeforeSendHeaders.addListener(async ({url}) => {
    if (url && url.includes("dropship.amazon.com/web/packPackage/")) {
        console.log(currentLabel);

        const currentDateAndTime =  new Date();
        const todayDate = currentDateAndTime.toLocaleDateString("en-US");
        const currentTime = ('0' + currentDateAndTime.getHours()).slice(-2) + ":" +('0' + currentDateAndTime.getMinutes()).slice(-2);


        if (!currentLabel) {
            const newErrorLog = createNewLog(currentTime, "ERROR", "Couldn't identify the order packed!");

            await saveLog(todayDate, newErrorLog);

            return;
        };


        await addToPreviouslyPacked(todayDate, currentLabel);
        
        await addToLifeTimePacked(currentLabel);

        const newLog = createNewLog(currentTime, "ORDER PACKED", currentLabel.quantity + " " + currentLabel.type + " add to total");

        await saveLog(todayDate, newLog);

        currentLabel = undefined;
        
    }
}, {urls: ["<all_urls>"]});

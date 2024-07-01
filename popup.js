const showEditRecordsUi = () => {

    const inputContainer = document.getElementById("editRecords-InputContainer");
    inputContainer.style.display = "initial";

    const displayElement = document.getElementById("dataDisplay");
    displayElement.innerHTML = "";
    displayElement.style.display = "none";

};


const toggleEditType = () => {

    const inputElement = document.getElementById("editTypeSelection");
    const currentType = inputElement.getAttribute("edittype");
    const amountToEditInput =  document.getElementById("edit-record-number-input");

    if (currentType === "ADD") {

        inputElement.innerText = "-";
        inputElement.style.color = "red";
        inputElement.setAttribute("edittype", "REMOVE");

        amountToEditInput.style.color = "red";

    } else {

        inputElement.innerText = "+";
        inputElement.style.color = "green";
        inputElement.setAttribute("edittype", "ADD");

        amountToEditInput.style.color = "green";

    };

};

const displayLogs = async () => {
    const editRecordsUi = document.getElementById("editRecords-InputContainer");
    editRecordsUi.style.display = "none";

    const displayElement = document.getElementById("dataDisplay");
    displayElement.innerHTML = '<div class="splitter my-1"></div>';
    displayElement.style.display = "initial";

    const previousLogs = await fetchFromChromeStorage("TODAYS-FAASTPLUS-LOGS", undefined);


    if (!previousLogs) {
        displayElement.innerText = "No logs found :("
        return;
    };

    const logsTable = document.createElement("table");
    logsTable.setAttribute("class", "stripedTable");

    let currentRow = document.createElement("tr");

    const topMostHeader = document.createElement("th");
    topMostHeader.colSpan = 3;
    topMostHeader.style.textAlign = "center";
    topMostHeader.innerText = "Date: " + previousLogs.date;
    currentRow.appendChild(topMostHeader);
    logsTable.appendChild(currentRow);


    const keys = ["time", "type", "desc"];

    currentRow = document.createElement("tr");

    const dateOfLogsContainer = document.createElement("th");
    dateOfLogsContainer.colSpan = 3;
    dateOfLogsContainer.style.textAlign = "center";
    dateOfLogsContainer.innerText = "DATE: " + previousLogs.date;
    currentRow.appendChild(dateOfLogsContainer);

    logsTable.appendChild(currentRow);

    currentRow = document.createElement("tr");
    for (let key of keys) {
        let currentHeader = document.createElement("th");
        currentHeader.innerText = key.toUpperCase();
        currentRow.appendChild(currentHeader);
    };

    logsTable.appendChild(currentRow);

    const logs = previousLogs.logs;

    for (let i=logs.length-1; i>=0; i--) {
        currentRow = document.createElement("tr");

        for (let key of keys) {
            let currentCell = document.createElement("td");
            currentCell.innerText = logs[i][key];
            currentRow.appendChild(currentCell);
        }

        logsTable.appendChild(currentRow);
    }

    displayElement.appendChild(logsTable);

};


function isInteger(str) {
    if (typeof str != "string") return false 
    return !isNaN(str) && !isNaN(parseInt(str)) 
}


const clearAllRecords = async () => {
    await chrome.runtime.sendMessage({
        type: "RESET-ALL-RECORDS",
    }, (response) => {updateStats(response);});
};


const sendAdjustRecordsRequest = async (typeOfAdjustment, typeOfOrder, quantityToAdjust) => {
    await chrome.runtime.sendMessage({
        type: "ADJUST-RECENT-RECORDS",
        AdjustmentType: typeOfAdjustment,
        OrderType: typeOfOrder,
        quantity: quantityToAdjust,
    }, response => {updateStats(response);});
};



const adjustRecords = async (typeOfOrder) => {
    const amountToEditInput =  document.getElementById("edit-record-number-input");
    const amountToEdit =  amountToEditInput.value;
    const typeSelection  = document.getElementById("editTypeSelection").getAttribute("edittype");

    const allowedTypes = ["ADD", "REMOVE"];
    const allowedOrderTypes = ["SIOC", "SINGLE", "MULTI"];

    if (allowedOrderTypes.includes(typeOfOrder) && allowedTypes.includes(typeSelection) && isInteger(amountToEdit)) {
        await sendAdjustRecordsRequest(typeSelection, typeOfOrder, parseInt(amountToEdit));
    };

    amountToEditInput.value = "";
};




const updateStats = (response) => {

    if (!response) {
        return;
    };

    const {state, message} = response;

    if (state === "SUCCESS") {
        displayLifeTimePacked();

        displayRecentlyPacked();
    } else if (state === "FAIL") {
        const errorDisplay = document.getElementById("errorDisplay");

        errorDisplay.style.display = "initial";
        errorDisplay.innerHTML = "<p class='error'>" +  message + "</p>";

        setTimeout(() => {
            const errorDisplay = document.getElementById("errorDisplay");

            errorDisplay.style.display = "none";
            errorDisplay.innerText = "";
        }, 5000);
    }
    
};



const displayLifeTimePacked = async () => {
    const displayElement = document.getElementById("lifetime-packed-display");
    displayElement.innerHTML = "";
    
    const lifeTimePacked = await fetchFromChromeStorage("LIFETIME-PACKED", {SIOC: 0, MULTI: 0, SINGLE: 0});

    let totalPacked = 0

    const totalDisplay = document.createElement("h2");
    displayElement.appendChild(totalDisplay);

    const typePackedDisplay = document.createElement("p");
    typePackedDisplay.setAttribute("class", "add-flex space-around text-l")

    for (let type of ["SIOC", "MULTI", "SINGLE"]) {
        totalPacked += lifeTimePacked[type];

        let newElement = document.createElement("span");
        newElement.setAttribute("class", type.toLowerCase()+"-color");
        newElement.innerText = type + ": " + lifeTimePacked[type];

        typePackedDisplay.appendChild(newElement);
    }

    displayElement.appendChild(typePackedDisplay);

    totalDisplay.innerText = "ALL-TIME TOTAL: " + totalPacked;
};

const displayRecentlyPacked = async () => {
    const previouslyPacked = await fetchFromChromeStorage("RECENTLY-PACKED");
    const tableElementBody = document.querySelector("#packed-status tbody");
    tableElementBody.innerHTML = ""

    for (let i=previouslyPacked.length-1; i>=0; i--) {
        let data = previouslyPacked[i];
        
        let currentRow = document.createElement("tr");
        
        let currentTotalPacked = 0;
        let currentTotalCell = document.createElement("td");
        for (let key of ["date", "SIOC", "MULTI", "SINGLE"]) {
            let currentCell = document.createElement("td");
            currentCell.innerText = data[key];
            
            if (key != "date") {
                currentTotalPacked += data[key];
            }

            currentRow.appendChild(currentCell);
        }

        currentTotalCell.innerText = currentTotalPacked;
        currentRow.appendChild(currentTotalCell);

        tableElementBody.appendChild(currentRow);
    };

};



const fetchFromChromeStorage = async (key, defaultResponse=[]) => {
    return new Promise((resolve) => {
        chrome.storage.sync.get([key], (obj) => {
            resolve(obj[key] ? JSON.parse(obj[key]) : defaultResponse);
        });
    });
};



const clearAllRecordsButton = document.getElementById("clearRecord-btn");

const displayLogsButton = document.getElementById("displayLogsButton");

const editRecordsButton = document.getElementById("editRecordsButton");

const editTypeSelectionButton = document.getElementById("editTypeSelection");

const adjustmentTypeBtnContainer = document.getElementById("adjustmentTypeBtnContainer");

const amountToEditInput =  document.getElementById("edit-record-number-input");


document.addEventListener("DOMContentLoaded", () => {
    
    displayLifeTimePacked();

    displayRecentlyPacked();

    displayLogsButton.addEventListener("click", displayLogs);

    editRecordsButton.addEventListener("click", showEditRecordsUi);

    clearAllRecordsButton.addEventListener("click", () => {
        if (window.confirm("Are You Sure You Want to Clear All Records?")) {
            clearAllRecords();
        };
    });

    editTypeSelectionButton.addEventListener("click", toggleEditType);

    amountToEditInput.style.color = "green";

    adjustmentTypeBtnContainer.querySelector("button[name=SIOC]").addEventListener("click", () => {adjustRecords("SIOC");});
    adjustmentTypeBtnContainer.querySelector("button[name=MULTI]").addEventListener("click", () => {adjustRecords("MULTI");});
    adjustmentTypeBtnContainer.querySelector("button[name=SINGLE]").addEventListener("click", () => {adjustRecords("SINGLE");});

    document.querySelector("footer .gitHub-Style-btn").addEventListener("click", () => {
        chrome.tabs.create({active: true, url: "https:github.com/Musa-Kal"});
    });
});
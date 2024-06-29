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

    if (currentType === "ADD") {

        inputElement.innerText = "-";
        inputElement.style.color = "red";
        inputElement.setAttribute("edittype", "REMOVE");

    } else {

        inputElement.innerText = "+";
        inputElement.style.color = "green";
        inputElement.setAttribute("edittype", "ADD");

    };

};

const displayLogs = async () => {
    const editRecordsUi = document.getElementById("editRecords-InputContainer");
    editRecordsUi.style.display = "none";

    const previousLogs = await fetchFromChromeStorage("TODAYS-FAASTPLUS-LOGS", undefined);

    const displayElement = document.getElementById("dataDisplay");
    displayElement.innerHTML = "";
    displayElement.style.display = "initial";

    if (!previousLogs) {
        displayElement.innerText = "No logs found :("
        return;
    };

    const logsTable = document.createElement("table");
    logsTable.setAttribute("class", "stripedTable");

    const keys = ["time", "type", "desc"];

    let currentRow = document.createElement("tr");
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



const clearAllRecords = () => {
    chrome.runtime.sendMessage({
        type: "RESET-ALL-RECORDS",
    }, updateStats);
};


const adjustRecords = (typeOfAdjustment, typeOfOrder, quantityToAdjust) => {
    chrome.runtime.sendMessage({
        type: "ADJUST-RECENT-RECORDS",
        AdjustmentType: typeOfAdjustment,
        OrderType: typeOfOrder,
        quantity: quantityToAdjust,
    }, updateStats);
};

const updateStats = () => {
    displayLifeTimePacked();

    displayRecentlyPacked();
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

    for (let data of previouslyPacked) {
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


document.addEventListener("DOMContentLoaded", () => {
    
    displayLifeTimePacked();

    displayRecentlyPacked();

    displayLogsButton.addEventListener("click", displayLogs);

    editRecordsButton.addEventListener("click", showEditRecordsUi);

    clearAllRecordsButton.addEventListener("click", clearAllRecords);

    editTypeSelectionButton.addEventListener("click", toggleEditType);

});
import {fetchFromChromeStorage, stringToHash} from "../../utils/utils.js"
import {PA_VIEW_PASSWORD_HASH, PAST_PRODUCTIVITY_REPORT_PASSWORD_HASH} from "../../utils/passwordHash.js"


const wrongPasswordAlert = () => {
    alert("Incorrect Password!\nContact The Author For Password If Needed.");
};

const PA_ViewToggle = async () => {
    const passwordInputted = prompt("Please Input PASSWORD to Toggle PA View:");

    const currentPA_ViewState = await fetchFromChromeStorage("PA_VIEW_ENABLED", false);

    if (stringToHash(passwordInputted) === PA_VIEW_PASSWORD_HASH) {
        const toggledPA_ViewState = !currentPA_ViewState;

        chrome.storage.sync.set({
            ["PA_VIEW_ENABLED"]: JSON.stringify(toggledPA_ViewState)
        });

        return toggledPA_ViewState;
    } else {
        wrongPasswordAlert();
    }

    return currentPA_ViewState;

};


const allSecureSettings = [ // [Toggle Functions, Chrome Storage Key, Default State, Display Name]
    [PA_ViewToggle, "PA_VIEW_ENABLED", false, "PA VIEW:"]
];


const allOpenSettings = [ // [Chrome Storage Key, Default State, Display Name]
    ["IMPROVE_NEW_ORDER_SCAN_UI_ENABLED", true, "NEW ORDER SCAN ASSIST:"]
];

document.addEventListener("DOMContentLoaded", async () => {
    const optionsConfigurationsTable = document.getElementById("optionsConfigurationsTable");

    for (let setting of allSecureSettings) {
        addRowWithSecureSetting(optionsConfigurationsTable, setting);
    };

    for (let setting of allOpenSettings) {
        addRowWithSetting(optionsConfigurationsTable, setting);
    };

    setUpProductivityReportDateInput();

});


// TODO: Finish this \/
const setUpProductivityReportDateInput = async () => {
    const fetchingProductivityReportData = await fetchFromChromeStorage("FETCHING-PRODUCTIVITY-REPORT-DATA", false);

    const [todayDate] = new Date().toISOString().split("T");
    const [year, month, day] = todayDate.split("-");
    const previousYearsDate = (parseInt(year) - 1) + "-" + month + "-" + day;

    const fetchAfterDateInput = document.getElementById("fetchAfterDateInput");
    const fetchBeforeDateInput = document.getElementById("fetchBeforeDateInput");
    

    fetchAfterDateInput.max = todayDate;
    fetchAfterDateInput.min = previousYearsDate;

    fetchAfterDateInput.addEventListener("change", () => {
        fetchBeforeDateInput.min = fetchAfterDateInput.value;
    });

    fetchBeforeDateInput.max = todayDate;
    fetchBeforeDateInput.min = previousYearsDate;

    fetchBeforeDateInput.addEventListener("change", () => {
        fetchAfterDateInput.max = fetchBeforeDateInput.value;
    });

    const cancelPreviousRequestButton = document.getElementById("cancel-previous-request-button");

    const productivityReportGenerateButton = document.getElementById("productivity-report-generate-button");
    productivityReportGenerateButton.disabled = fetchingProductivityReportData;

    cancelPreviousRequestButton.addEventListener("click", () => {

        chrome.storage.sync.remove(["PAST-ASSIGNED-BY-NAME", "FETCHING-PRODUCTIVITY-REPORT-DATA", "DATE-TO-FETCH-PRODUCTIVITY-REPORT-AFTER", "DATE-TO-FETCH-PRODUCTIVITY-REPORT-BEFORE"], function(){
            var error = chrome.runtime.lastError;
            if (error) {
                console.log(error);
            }
        })
        
        productivityReportGenerateButton.disabled = false;
        
    });

    productivityReportGenerateButton.addEventListener("click", (event) => {

        const passwordInputted = prompt("Please Input PASSWORD to GENERATE Productivity Report:");

        if (stringToHash(passwordInputted) === PAST_PRODUCTIVITY_REPORT_PASSWORD_HASH) {

            event.target.disabled = true;

            const fetchAfterDate = fetchAfterDateInput.value?.replace('-', '/');
            const fetchBeforeDate = fetchBeforeDateInput.value?.replace('-', '/');

            generateProductivityReport(fetchAfterDate, fetchBeforeDate);

        } else {
            wrongPasswordAlert();
        }
        
    })
};


const generateProductivityReport = (fetchAfterDate, fetchBeforeDate) => {
    const [todayDate] = new Date().toISOString().split("T");
    const [year, month, day] = todayDate.split("-");

    const todayDateTime = new Date(year + "/" + month + "/" + day).getTime();
    const previousYearsDateTime = new Date((parseInt(year) - 1) + "/" + month + "/" + day).getTime();

    const fetchAfterTime = new Date(fetchAfterDate).getTime();
    const fetchBeforeTime = new Date(fetchBeforeDate).getTime();

    if ( fetchAfterTime && fetchBeforeTime &&
        fetchAfterTime <= fetchBeforeTime && 
        previousYearsDateTime <= fetchAfterTime &&
        fetchAfterTime <= todayDateTime &&
        previousYearsDateTime <= fetchBeforeTime &&
        fetchBeforeTime <= todayDateTime
    ) {

        chrome.storage.sync.set({
            ["PAST-ASSIGNED-BY-NAME"]: JSON.stringify({}),
            ["FETCHING-PRODUCTIVITY-REPORT-DATA"]: JSON.stringify(true),
            ["DATE-TO-FETCH-PRODUCTIVITY-REPORT-AFTER"]: JSON.stringify(fetchAfterDate),
            ["DATE-TO-FETCH-PRODUCTIVITY-REPORT-BEFORE"]: JSON.stringify(fetchBeforeDate)
        }).then(() => {

            chrome.tabs.create({active: true, url: "https://dropship.amazon.com/web/picktasks?selectedStatus=ALL&selectedTimeFrame=ALL&pageSize=1000"});

        });

    } else {
        alert("INVALID DATE SELECTION !!!")
    }


};


const addRowWithSecureSetting = async (parentElement, setting) => {
    insertToggleOptionRow(parentElement, setting[3], (await fetchFromChromeStorage(setting[1], setting[2])), (event) => {
        toggleSettingAndSlider(event.target, setting[0]);
    });
}


const addRowWithSetting = async (parentElement, setting) => {
    insertToggleOptionRow(parentElement, setting[2], (await fetchFromChromeStorage(setting[0], setting[1])), (event) => {
        toggleSettingAndSlider(event.target, () => {return toggleSetting(setting[0])});
    });
}



const toggleSetting = async (settingName) => {

    const toggledSettingStateState = !(await fetchFromChromeStorage(settingName, false));

    chrome.storage.sync.set({
        [settingName]: JSON.stringify(toggledSettingStateState)
    });

    return toggledSettingStateState;
};

const toggleSettingAndSlider = async (sliderElement, toggleFunction) => {
    const settingState = (await toggleFunction());

    sliderElement.checked = settingState;
}


const insertToggleOptionRow = (tableElement, labelName, checkBox, toggleFunction) => {

    const newRow = document.createElement("tr");

    let currentCell = document.createElement("td");
    currentCell.setAttribute("class", "text-l");
    currentCell.innerText = labelName;
    newRow.appendChild(currentCell);

    currentCell = document.createElement("td");
    currentCell.setAttribute("class", "optionsSelection");

    const toggleButton = createToggleButton(checkBox, toggleFunction);
    currentCell.appendChild(toggleButton);

    newRow.appendChild(currentCell);

    tableElement.appendChild(newRow);
};



const createToggleButton = (boxCheck=false, functionToBind=false) => {
    const toggleButton = document.createElement("label")
    toggleButton.setAttribute("class", "switch");

    const checkBox = document.createElement("input");
    checkBox.setAttribute("type", "checkbox");
    checkBox.checked = boxCheck;
    toggleButton.appendChild(checkBox);

    if (functionToBind) {
        checkBox.addEventListener("click", functionToBind);
    }

    const slider = document.createElement("span");
    slider.setAttribute("class", "slider round");
    toggleButton.appendChild(slider);
    
    return toggleButton;
};
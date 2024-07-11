import {fetchFromChromeStorage, stringToHash, PA_VIEW_PASSWORD_HASH} from "./utils.js"


const PA_ViewToggle = async () => {
    const passwordInputted = prompt("Please Input PASSWORD to Toggle PA View:");

    const currentPA_ViewState = await fetchFromChromeStorage("PA_VIEW_ENABLED", false);

    if (stringToHash(passwordInputted) === PA_VIEW_PASSWORD_HASH) {
        const toggledPA_ViewState = !currentPA_ViewState;

        chrome.storage.sync.set({
            ["PA_VIEW_ENABLED"]: JSON.stringify(toggledPA_ViewState)
        });

        settingsChangeAlert("PA_VIEW_ENABLED", toggledPA_ViewState);

        return toggledPA_ViewState;
    } else {
        window.confirm("Incorrect Password!\nContact The Author For Password If Needed.");
    }

    return currentPA_ViewState;

};


const allSecureSettings = [ // [Toggle Functions, Chrome Storage Key, Default State, Display Name]
    [PA_ViewToggle, "PA_VIEW_ENABLED", false, "PA VIEW:"]
];


const allOpenSettings = [ // [Chrome Storage Key, Default State, Display Name]
    ["IMPROVE_NEW_ORDER_SCAN_UI_ENABLED", true, "NEW ORDER SCAN SCAN ASSIST:"]
];

document.addEventListener("DOMContentLoaded", () => {
    const optionsConfigurationsTable = document.getElementById("optionsConfigurationsTable");

    for (let setting of allSecureSettings) {
        addRowWithSecureSetting(optionsConfigurationsTable, setting);
    };

    for (let setting of allOpenSettings) {
        addRowWithSetting(optionsConfigurationsTable, setting);
    };

});


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


const settingsChangeAlert = (settingName, settingState) => {
    chrome.runtime.sendMessage( {
        type: "SETTINGS-CHANGED",
        setting: {
            name: settingName,
            state: settingState
        }
    });
};


const toggleSetting = async (settingName) => {

    const toggledSettingStateState = !(await fetchFromChromeStorage(settingName, false));

    chrome.storage.sync.set({
        [settingName]: JSON.stringify(toggledSettingStateState)
    });

    settingsChangeAlert(settingName, toggledSettingStateState);

    return toggledSettingStateState;
};

const toggleSettingAndSlider = async (sliderElement, toggleFunction) => {
    const settingState = (await toggleFunction());

    sliderElement.checked = settingState;
}


const insertToggleOptionRow = (tableElement, labelName, checkBox, toggleFunction) => {

    const newRow = document.createElement("tr");

    let currentCell = document.createElement("td");
    currentCell.setAttribute("class", "font-l");
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
(async () => {
    const src = chrome.runtime.getURL("./js/utils/utils.js");
    const contentMain = await import(src);
    const createElementWithId = contentMain.createElementWithId;
    

    /**
     * 
     * Function sends to record adjustment request to service worker and click on the 
     * (scanAndVerifyButton) html element.
     * 
     * @param {string} identifierOfPickTask - SIOC | SINGLE | MULTI 
     * @param {number} quantityOfUnitsInOrder 
     * @param {HTMLAllCollection} scanAndVerifyButton 
     * @param {string} typeOfAdjustment  
     */
    const addAndContinue = (identifierOfPickTask, quantityOfUnitsInOrder, scanAndVerifyButton, typeOfAdjustment) => {

        chrome.runtime.sendMessage( {
            type: typeOfAdjustment,
            pickTaskIdentifier: identifierOfPickTask,
            quantity: quantityOfUnitsInOrder,
        });
    
        scanAndVerifyButton.click();
    }
    


    /**
     * 
     * Functions adds two buttons on the quick pack screen with appropriate functionality.
     * 
     */
    const displayQuickPackPrompt = () => {
        const mainUI_element = document.querySelector(".ui-content");
        const scanAndVerifyButton = document.getElementById("continueToScanVerify");
    
        if (mainUI_element && scanAndVerifyButton && !document.getElementById("quickPack-type-select")) {
            const newElement = createElementWithId("div", "quickPack-type-select");
            newElement.setAttribute("style", "width: 100%; margin: 25px 0; display: flex; justify-content: space-between;");
    
            const orderColor = {"SIOC": "green", "SINGLE": "blue"}
            
            for (let type of ["SIOC", "SINGLE"]) {
                let currentButton = createElementWithId("button", "select-"+type+"continue");
                currentButton.setAttribute("style", 
                    "width: 49%;" + 
                    "height: 35px;" + 
                    "border-radius: 5px;" +
                    "background-color: " + orderColor[type] + ";" +
                    "border: none;" + 
                    "color: white;" + 
                    "font-weight: bold;" +
                    "font-size: large;" + 
                    "cursor: pointer;"
                );
    
                currentButton.addEventListener("mouseover", () => {
                    currentButton.style.opacity = "80%";
                });
    
                currentButton.addEventListener("mouseout", () => {
                    currentButton.style.opacity = "100%";
                })
    
                currentButton.innerText = "Add to " + type + " and Continue";
                const printLabelButton = document.querySelector("#printShippingLabels .ui-btn-text");
    
                currentButton.addEventListener("click", (event) => {
                    event.target.disabled = true;
                    addAndContinue(type, parseInt(printLabelButton.innerText.split("(")[1]), scanAndVerifyButton, "QUICKPACK-ADD-UNITS-PACKED");
                });
    
                newElement.appendChild(currentButton);
            }
    
            mainUI_element.appendChild(newElement);
        }
    };
    
    
    displayQuickPackPrompt();
})();
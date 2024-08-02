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
    
            const printLabelButton = document.querySelector("#printShippingLabels .ui-btn-text");
            const pickTaskQuantity = parseInt(printLabelButton.innerText.split("(")[1]);

            for (let type of ["SIOC", "SINGLE"]) {
                let currentButton = createElementWithId("button", "select-"+type+"continue");

                currentButton.setAttribute("class", "yeet-button " + "btn-" + type.toLowerCase() + " py-1" + " text-l");
                currentButton.style.width = "49%";
    
                currentButton.innerText = "Add to " + type + " and Continue";
    
                currentButton.addEventListener("click", (event) => {
                    event.target.disabled = true;
                    addAndContinue(type, pickTaskQuantity, scanAndVerifyButton, "QUICKPACK-ADD-UNITS-PACKED");
                });
    
                newElement.appendChild(currentButton);
            }
    
            mainUI_element.appendChild(newElement);
        }
    };
    
    
    displayQuickPackPrompt();
})();
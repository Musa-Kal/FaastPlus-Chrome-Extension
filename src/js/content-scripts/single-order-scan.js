(async () => {
    const src = chrome.runtime.getURL("./js/utils/utils.js");
    const contentMain = await import(src);
    const createElementWithId = contentMain.createElementWithId;
    const fetchFromChromeStorage = contentMain.fetchFromChromeStorage;

    const settingState = await fetchFromChromeStorage("IMPROVE_NEW_ORDER_SCAN_UI_ENABLED", true);


    const orderJsonHiddenInput = document.getElementById("ordersJson")

    if (orderJsonHiddenInput) {
        const scanAndVerifyBtnParent = orderJsonHiddenInput.parentNode.parentNode;

        if (!document.getElementById("addPickTaskAndContinue-btn")) {
            let newBtn = createElementWithId("button", "addPickTaskAndContinue-btn");
            newBtn.setAttribute("class", "btn");
            newBtn.setAttribute("style",
                "height: 35px;" +
                "margin-top: 30px;" +
                "background-color: " + "#ccf797" + ";" +
                "font-weight: bold;" +
                "font-size: large;"
            );
            newBtn.innerText = "Add Pick Task to Total and Continue";

            const scanAndVerifyButton = scanAndVerifyBtnParent.querySelector(".continue-to-scan-verify");
            const type = document.querySelector(".pack-for-id h2").innerText.split(" ")[2];

            newBtn.addEventListener("click", (event) => {
                event.target.disabled = true;
                addAndContinue(type, false, scanAndVerifyButton, "ADD-PICK-TASK-QUANTITY-TO-TOTAL");
            });

            scanAndVerifyBtnParent.parentNode.appendChild(newBtn);

        }
    } else if (settingState) {

        const targetNode = document.querySelector(".content-container.container");

        const config = { attributes: true, childList: false, subtree: true };

        const callback = (mutationList) => {

            for (const mutation of mutationList) {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    improveProductScanUI();
                }
            };

        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);

        improveProductScanUI();

    }



    /**
     * Functions displays the number of scannable instances of the product
     * appearing in first row of #scan-verify-table element.
     * 
     */
    const improveProductScanUI = () => {

        const scanTableElement = document.getElementById("scan-verify-table");
    
        if (scanTableElement) {
            
            const scanTable = scanTableElement.querySelector("tbody").children;
            
            
            let scannableCount = 0;
            const topElement_fnsku = scanTable[0].children[2].querySelector(".fnsku-scan").getAttribute("fnsku");
    
    
            for (let element of scanTable) {
                let fnskuElement = element.children[2].querySelector(".fnsku-scan");
    
                if ((fnskuElement.getAttribute("fnsku") === topElement_fnsku) && (!fnskuElement.classList.contains("scan-verified"))) {
                    scannableCount ++;
                }
    
                element.style.border = "none";
            }
    
            scanTable[0].style.border = "2px solid #5ceaf7";
    
            
            if (!document.getElementById("item-count-display")) {
                const newElement = createElementWithId("div", "item-count-display");
                newElement.style.fontSize = "15pt";
                document.getElementById("scan-item-section").insertBefore(newElement, scanTableElement);
            }
    
            const countDisplay = document.getElementById("item-count-display");
            countDisplay.innerHTML = "# of " + "<u>HIGHLIGHTED</u>" + " item to be Scanned: " + "<strong>" + scannableCount + "</strong>";
    
            
        } 
        
    };
    

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


})();
(() => {

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const {type} = obj;
        if (type === "NEWORDER") {
            improveProductScanUI();
        } else if (type === "COUNTPICKTASK") {
            improveReadyToPickUI();
        } else if  (type === "DISPLAY-PRODUCT-IMAGE") {
            improveNewOrderUI();
        } else if (type === "DISPLAY-QUICKPACK-PROMPT") {
            displayQuickPackPrompt();
        }


        if (type === "COUNTUNITS") {
            countAndSendUnits();
        }
    });


})();

const addAndContinue = (typeOfOrder, quantityOfUnitsInOrder, scanAndVerifyButton) => {

    chrome.runtime.sendMessage( {
        type: "QUICKPACK-ADD-UNITS-PACKED",
        pickTaskType: typeOfOrder,
        quantity: quantityOfUnitsInOrder,
    });

    scanAndVerifyButton.click();
}

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
                "font-size: large;"
            );

            currentButton.innerText = "Add to " + type + " and Continue";
            const printLabelButton = document.querySelector("#printShippingLabels .ui-btn-text");

            currentButton.addEventListener("click", (event) => {
                event.target.disabled = true;
                addAndContinue(type, parseInt(printLabelButton.innerText.split("(")[1]), scanAndVerifyButton);
            });

            newElement.appendChild(currentButton);
        }

        mainUI_element.appendChild(newElement);
    }
};


const improveNewOrderUI = () => {

    const batchInfoContainer = document.querySelector(".create-batch");

    const fnskuInputContainer = document.getElementById("fnsku-filter");

    const hiddenFnskuElement = fnskuInputContainer.querySelector("input[type=hidden]");

    const callback = () => {
        const productFnsku = hiddenFnskuElement.value;

        if (productFnsku.length < 10) {
            const selectedImgElement = document.getElementById("selected-img-display");
            if (selectedImgElement) {
                batchInfoContainer.removeChild(selectedImgElement);
            };

            return;
        }

        fetch("https://dropship.amazon.com/web/ajax/product/getProduct?fnskuOrUpc=" + productFnsku)
            .then((response) => {
                if  (response.ok) {
                    return response.json();
                }
                return Promise.reject(response);
            })
            .then((data) => {

                if (data.product) {

                    if (!document.getElementById("selected-img-display")) {
                        const newElement = createElementWithId("figure", "selected-img-display");
                        newElement.setAttribute("style", "width: 75%; margin: 0 auto;")
                        batchInfoContainer.appendChild(newElement);
                    }

                    const imgDisplayElement = document.getElementById("selected-img-display");
                    imgDisplayElement.innerHTML = "";

                    const productImageElement = document.createElement("img");
                    productImageElement.src = data.product.imageURL;
                    productImageElement.alt = "Product Image";
                    productImageElement.setAttribute("style", "width: 100%;");
                    imgDisplayElement.appendChild(productImageElement);

                    const productImageCaptionElement = document.createElement("figcaption");
                    productImageCaptionElement.innerHTML = "<strong>Selected Product: </strong>" + data.product.title;
                    productImageCaptionElement.setAttribute("style", "text-align: center;");
                    imgDisplayElement.appendChild(productImageCaptionElement);

                }
            })
            .catch((response) => {
                console.log(response);
            })
        
    };

    const config = { attributes: true };

    const observer = new MutationObserver(callback);

    observer.observe(hiddenFnskuElement, config);

}


const getTypeOfOrder = (type, quantity) => {
    if (type === "SIOC") {
        return "SIOC"
    } else if (quantity > 1) {
        return "MULTI"
    } else {
        return "SINGLE"
    }
};

const countAndSendUnits = () => {
    const scanTable = document.querySelectorAll("#scan-verify-table tr");
    if (scanTable.length > 0) {

        const totalUnitsInOrder = scanTable.length;
        const orderType = getTypeOfOrder(document.getElementsByClassName("packageBoxName")[0].innerText.trim(), totalUnitsInOrder);
        console.log(orderType + ": " + totalUnitsInOrder);

        chrome.runtime.sendMessage({
            type: "SET-CURRET-ORDER",
            typeOfOrder: orderType,
            quantity: totalUnitsInOrder,
        });
    }
}

const improveProductScanUI = () => {

    const scanTableElement = document.getElementById("scan-verify-table");

    if (scanTableElement) {

        countAndSendUnits();
        
        const scanTable = scanTableElement.querySelectorAll("tr");
        
        
        let scanableCount = 0;
        const topElement_fnsku = scanTable[0].querySelector(".fnsku-scan").getAttribute("fnsku");

        for (let element of scanTable) {
            let fnskuElement = element.getElementsByClassName("fnsku-scan")[0];

            if (fnskuElement.getAttribute("fnsku") === topElement_fnsku && (!fnskuElement.classList.contains("scan-verified"))) {
                scanableCount ++;
            }

            element.style.border = "none";
        }

        scanTable[0].style.border = "2px solid #5ceaf7";
        
        if (!document.getElementById("item-count-display")) {
            const newElement = createElementWithId("div", "item-count-display");
            newElement.style.fontSize = "15pt";
            document.getElementById("scan-item-section").insertBefore(newElement, document.getElementById("scan-verify-table"));
        }

        const countDisplay = document.getElementById("item-count-display");
        countDisplay.innerHTML = "# of " + "<u>HIGHLIGHTED</u>" + " item to be Scanned: " + "<strong>" + scanableCount + "</strong>";
        
    }
}

const improveReadyToPickUI = () => {
    
    if (document.getElementById("selected_status_for_showing_pick_tasks")) {
        if (!document.getElementById("assigned-pickTasks")) {
            const [titleElement] = document.getElementsByClassName("orange-title");
            titleElement.style.display = "flex";
            titleElement.style.justifyContent = "space-between";

            const newElement = createElementWithId("h4", "assigned-pickTasks");
            newElement.style.margin = "auto 0";
            newElement.style.color = "#666";
            newElement.style.textDecoration = "underline";
            titleElement.appendChild(newElement);
        }

        const pickTaskCount = document.getElementById("assigned-pickTasks");

        let count = 0;
        const userName = document.getElementsByClassName("userinfo-container")[0].innerText.split("(")[0].trim();
        
        for (let childEle of document.querySelectorAll("#picktask_table tbody tr")) {
            if (childEle.children[4].innerText.trim() == userName) {
                count ++;
            }
        }

        pickTaskCount.innerHTML = "Pick Tasks Assigned to you: " + "<span style=\"font-weight: bold;\">" + count + "</span>";

    }
}

const createElementWithId = (elementType, elementId) => {
    var newElement = document.createElement(elementType);
    newElement.id = elementId;
    return newElement;
}


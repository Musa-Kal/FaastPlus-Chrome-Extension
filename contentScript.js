(() => {

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const {type} = obj;
        
        if (type === "SINGLE-ORDER-SCAN-PAGE") {
            improveProductScanUI(obj.improveNewOrderScanUiEnabled);
        } else if (type === "SHOW-ADVANCE-PICKTASK-COUNT") {
            displayAllPickTaskInfo();
        } else if (type === "COUNTPICKTASK") {
            showTotalAssignedPickTasks();
        } else if  (type === "DISPLAY-PRODUCT-IMAGE") {
            improveNewOrderUI();
        } else if (type === "DISPLAY-QUICKPACK-PROMPT") {
            displayQuickPackPrompt();
        } else if (type === "DISPLAY-PICK-TASK-QUANTITY") {
            if (obj.quantity) {
                displayPickTaskQuantityOnPrint(obj.quantity);
            }
        }

    });


})();



const stringToColour = (str) => {
    let hash = 0;
    for  (let i=0; i<str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) + hash)
    }
    let colour = '#'
    for (let i = 0; i < 3; i++) {
      colour += ((hash >> (i * 8)) & 0xff).toString(16).padStart(2, '0')
    }
    return colour
}

const displayPickTaskQuantityOnPrint = (pickTaskQuantity) => {
    const quantityColumn = document.querySelector(".quantity-column");

    if (quantityColumn) {
        quantityColumn.innerHTML = "";
        quantityColumn.innerText = "Quantity to Pick: ";

        const quantityElement = document.createElement("span");
        quantityElement.style.fontSize = "15px";
        quantityElement.style.fontWeight = "bold";
        quantityElement.innerText = pickTaskQuantity;

        quantityColumn.appendChild(quantityElement);
    }
};

const addAndContinue = (identifierOfPickTask, quantityOfUnitsInOrder, scanAndVerifyButton, typeOfAdjustemnt) => {

    chrome.runtime.sendMessage( {
        type: typeOfAdjustemnt,
        pickTaskIdentifier: identifierOfPickTask,
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


const improveScanAndVerifyUI = () => {

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
    }
};


const improveProductScanUI = (improveNewOrderScanUiEnabled) => {

    const scanTableElement = document.getElementById("scan-verify-table");

    if (improveNewOrderScanUiEnabled && scanTableElement) {
        
        const scanTable = scanTableElement.querySelector("tbody").children;
        
        
        let scanableCount = 0;
        const topElement_fnsku = scanTable[0].children[2].querySelector(".fnsku-scan").getAttribute("fnsku");

        for (let element of scanTable) {
            let fnskuElement = element.children[2].querySelector(".fnsku-scan");

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
        
    } else if (!scanTableElement) {
        improveScanAndVerifyUI();
    }
}


const showTotalAssignedPickTasks = () => {

    if (!document.getElementById("selected_status_for_showing_pick_tasks")) {
        return;
    }

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

};



const getPickTaskType = (attributesElement) => {
    
    if (!attributesElement) {
        return undefined;
    }

    let pickTaskType = "OTHER";

    for (let currentAttribute of  attributesElement.children) {
        if (currentAttribute.title === "SIOC") {
            return "SIOC";
        } else if (currentAttribute.title === "Multi") {
            return "MULTI";
        } else if (currentAttribute.title === "Single") {
            pickTaskType = "SINGLE";
        }
    }

    return pickTaskType;
};


const displayMoreDetailsOfAssignee = (displayElement, assigneeData) => {

    displayElement.innerHTML = "";

    const title = document.createElement("h3");
    title.setAttribute("style", 
        "text-align: center;" + 
        "border-bottom: 2px solid" + assigneeData.themeColor + ";"
    );
    title.innerText = assigneeData.name;
    displayElement.appendChild(title);

    const tableElement = document.createElement("table");
    tableElement.setAttribute("style", 
        "color: black;" +
        "font-family: Arial, Helvetica, sans-serif;" +
        "border-collapse: collapse;" +
        "width: 100%;"
    );
    displayElement.appendChild(tableElement);


    const rowKeys = ["SIOC", "MULTI", "SINGLE", "OTHER"];
    const colKeys = ["pickTasks", "orders", "units"];


    const titleCellStyle = (
        "padding-top: 12px;" +
        "padding-bottom: 12px;" +
        "text-align: left;" +
        "background-color: #3b3b3b;" +
        "color: white;"
    );


    const regularCellStyle = (
        "border: 1px solid #ddd;" +
        "padding: 8px;"
    );

    let currentRow = document.createElement("tr");
    tableElement.appendChild(currentRow);
    
    let currentCell = document.createElement("td");
    currentCell.setAttribute("style", regularCellStyle + titleCellStyle);
    currentRow.appendChild(currentCell);

    for (let key of rowKeys) {
        currentCell = document.createElement("td");
        currentCell.setAttribute("style", regularCellStyle + titleCellStyle);
        currentCell.innerText = key;
        currentRow.appendChild(currentCell);
    };

    const backgroundColors = ["#ececec", "white"];
    const displayColKeysNames = ["Pick Tasks", "Orders", "Units"];

    for (let i=0; i<colKeys.length; i++) {
        let colKey = colKeys[i];

        currentRow = document.createElement("tr");
        currentRow.style.backgroundColor = backgroundColors[i&1];

        currentCell = document.createElement("td");
        currentCell.setAttribute("style", regularCellStyle + titleCellStyle);
        currentCell.innerText = displayColKeysNames[i];
        currentRow.appendChild(currentCell);

        for (let rowKey of rowKeys) {
            currentCell = document.createElement("td");
            currentCell.setAttribute("style", regularCellStyle);
            currentCell.innerText = assigneeData[rowKey][colKey];
            currentRow.appendChild(currentCell);
        }

        tableElement.appendChild(currentRow);
    }


};


const displayAllPickTaskInfo = () => {

    if (!document.getElementById("selected_status_for_showing_pick_tasks")) {
        return;
    }

    const orangeTitle = document.querySelector(".orange-title");

    if (!document.getElementById("advancePickTaskDisplay")) {
        const newElement = createElementWithId("div", "advancePickTaskDisplay");
        newElement.setAttribute("style", "width: 100%; margin-top: 20px;");
        orangeTitle.parentNode.insertBefore(newElement, orangeTitle);
    }

    const advancePickTaskDisplay = document.getElementById("advancePickTaskDisplay");
    advancePickTaskDisplay.innerHTML = "";

    const barContainer = document.createElement("div");
    barContainer.setAttribute("style", "width: 100%; display: flex;");
    advancePickTaskDisplay.appendChild(barContainer);

    const moreAdvancePickTaskDisplay = createElementWithId("div", "moreAdvancePickTaskDisplay");
    moreAdvancePickTaskDisplay.setAttribute("style", "width: 100%;");
    advancePickTaskDisplay.appendChild(moreAdvancePickTaskDisplay);

    let nameToIndex = {};
    let countByName = [];
    let currentIndex = 0;
    let totalPickTasks = 0;

    for (let childEle of document.querySelectorAll("#picktask_table tbody tr")) {
        let currentPickTaskAssignee = childEle.children[4].innerText.trim();
        let currentPickTaskUnits = parseInt(childEle.children[6].querySelector("div[role=\"progressbar\"]").ariaValueMax);
        let currentPickTaskType = getPickTaskType(childEle.children[7]);
        let currentPickTaskOrders = parseInt(childEle.children[8].querySelector("div[role=\"progressbar\"]").ariaValueMax);

        if (currentPickTaskAssignee === "") {
            currentPickTaskAssignee = "unassigned";
        };
        
        if (!(currentPickTaskAssignee in nameToIndex)) {
            nameToIndex[currentPickTaskAssignee] = currentIndex;
            currentIndex ++;

            countByName.push({
                name: currentPickTaskAssignee,
                amountAssigned: 0,
                SIOC: {
                    pickTasks: 0,
                    units: 0,
                    orders: 0
                },
                MULTI: {
                    pickTasks: 0,
                    units: 0,
                    orders: 0
                },
                SINGLE: {
                    pickTasks: 0,
                    units: 0,
                    orders: 0
                },
                OTHER: {
                    pickTasks: 0,
                    units: 0,
                    orders: 0
                },
                themeColor: stringToColour(currentPickTaskAssignee)
            });
        }

        let currentAssignee = countByName[nameToIndex[currentPickTaskAssignee]];
        
        currentAssignee.amountAssigned ++;
        currentAssignee[currentPickTaskType].pickTasks ++;
        currentAssignee[currentPickTaskType].units += currentPickTaskUnits;
        currentAssignee[currentPickTaskType].orders += currentPickTaskOrders;
        

        totalPickTasks ++;

    }
    
    countByName.sort((a, b) => b.amountAssigned - a.amountAssigned);

    for (let currentAssigneeInfo of countByName) {
        let currentBar = document.createElement("div");
        currentBar.setAttribute("style", 
            "width: "+ (currentAssigneeInfo.amountAssigned / totalPickTasks) * 100 +"%;" + 
            "border-top: 15px solid "+ currentAssigneeInfo.themeColor +";" + 
            "border-radius: 5rem;" + 
            "transition-duration: 100ms;" + 
            "cursor: pointer;"  
        );
        currentBar.title = currentAssigneeInfo.name + ", " + currentAssigneeInfo.amountAssigned + " Pick Task | " + Math.floor((currentAssigneeInfo.amountAssigned / totalPickTasks) * 100) +"%";
    
        currentBar.addEventListener("mouseover", () => {
            currentBar.style.zIndex = "1";
            currentBar.style.transform = "scale(1.1)";
        });

        currentBar.addEventListener("mouseout", () => {
            currentBar.style.zIndex = "0";
            currentBar.style.transform = "scale(1)";
        })

        currentBar.addEventListener("click", () => {displayMoreDetailsOfAssignee(moreAdvancePickTaskDisplay, currentAssigneeInfo)});

        barContainer.appendChild(currentBar);
    }   



};


const createElementWithId = (elementType, elementId) => {
    var newElement = document.createElement(elementType);
    newElement.id = elementId;
    return newElement;
}


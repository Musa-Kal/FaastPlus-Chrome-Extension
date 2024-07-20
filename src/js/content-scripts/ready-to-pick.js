(async () => {
    const src = chrome.runtime.getURL("./js/utils/utils.js");
    const contentMain = await import(src);
    const createElementWithId = contentMain.createElementWithId;
    const stringToColor = contentMain.stringToColor;

    contentMain.fetchFromChromeStorage("PA_VIEW_ENABLED", false)
    .then(settingState => {
        
       if (settingState) {
        displayAllPickTaskInfo();
       } else {
        showTotalAssignedPickTasks();
       }
    }) 



    /**
     * 
     * Functions returns type of pick task. type can be either: SIOC | MULTI | SINGLE | OTHER
     * 
     * @param {HTMLAllCollection} attributesElement 
     * @returns 
     */
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
    
    

    /**
     * 
     * Functions takes assignee data and displays it as bar chart in the display element.
     * 
     * @param {HTMLAllCollection} displayElement 
     * @param {JSON} assigneeData 
     */
    const displayMoreDetailsOfAssignee = (displayElement, assigneeData) => {
    
        displayElement.innerHTML = "";
    
        const title = document.createElement("h3");
        title.setAttribute("style", 
            "text-align: center;" + 
            "padding-bottom: 10px;" + 
            "border-bottom: 5px solid" + assigneeData.themeColor + ";"
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
    
    

    /**
     * 
     * Functions displays pick tasks data as bar sorted bar chart for all assignee
     * 
     * @returns 
     */
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
                    themeColor: stringToColor(currentPickTaskAssignee)
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



    /**
     * 
     * Functions displays the count of pick tasks assigned to the logged in user.
     * 
     * @returns 
     */
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
    
    
})();
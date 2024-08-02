(async () => {
    const src = chrome.runtime.getURL("./js/utils/utils.js");
    const contentMain = await import(src);
    const fetchFromChromeStorage = contentMain.fetchFromChromeStorage;
    let assignedByName = await fetchFromChromeStorage("PAST-ASSIGNED-BY-NAME", {});

    const fetchingProductivityReportData = await fetchFromChromeStorage("FETCHING-PRODUCTIVITY-REPORT-DATA", false);
    const DateToFetchAfter = await fetchFromChromeStorage("DATE-TO-FETCH-PRODUCTIVITY-REPORT-AFTER", undefined);
    const DateToFetchBefore = await fetchFromChromeStorage("DATE-TO-FETCH-PRODUCTIVITY-REPORT-BEFORE", undefined);

    const timeToFetchAfter = new Date(DateToFetchAfter).getTime();
    const timeToFetchBefore = new Date(DateToFetchBefore).getTime();



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
     * Function turns formate json in to a cvs file and downloads the formed cvs file.
     * 
     * @param {JSON} jsonData 
     * @param {string} fileName 
     */
    const jsonToCVS = (jsonData, fileName) => {
        const cvsFormattedData = [
            ["From: " + DateToFetchAfter + "-" + DateToFetchBefore, "sioc", "sioc", "sioc", "multi", "multi", "multi", "single", "single", "single", "other", "other", "other"],
            ["assignee", "pick tasks", "orders", "units", "pick tasks", "orders", "units", "pick tasks", "orders", "units", "pick tasks", "orders", "units"]
        ];


        const typeOfPickTasks = ["SIOC", "MULTI", "SINGLE", "OTHER"];
        const typeAssigned = ["pickTasks", "orders", "units"];

        for (const name in jsonData) {

            let currentAssigneeData = jsonData[name];

            let currentRow = [];

            currentRow.push(name.replaceAll(",", " "));

            for (const typeOfPickTask of typeOfPickTasks) {
                for (const type of typeAssigned) {
                    currentRow.push(currentAssigneeData[typeOfPickTask][type]);
                }
            }

            cvsFormattedData.push(currentRow);
        };


        let csvContent = "data:text/csv;charset=utf-8," + cvsFormattedData.map(e => e.join(",")).join("\n");

        let encodedUri = encodeURI(csvContent);
        let link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", fileName + ".csv");
        document.body.appendChild(link); // Required for FireFox.
        link.click(); // This will download the above cvs file.

        link.remove(); 
    }
    

    /**
     * 
     * Functions displays pick tasks data as bar sorted bar chart for all assignee
     * 
     * @returns 
     */
    const fetchAllPickTaskInfo = () => {
    
        if (!document.getElementById("selected_status_for_showing_pick_tasks")) {
            return;
        }

        let dataFound = false;
        let outOfData = true;
    
    
        for (let childEle of document.querySelectorAll("#picktask_table tbody tr")) {   
            
            outOfData = false;

            let [currentPickTaskCreationDate] = childEle?.children[2]?.innerText?.split(' ');
            const currentPickTaskCreationTime = new Date(currentPickTaskCreationDate).getTime();

            if (!currentPickTaskCreationTime) {
                outOfData = true;
                break;
            }

            if (currentPickTaskCreationTime > timeToFetchBefore) {
                continue;
            } else if (currentPickTaskCreationTime < timeToFetchAfter) {
                dataFound = true;
                break;
            }
        
            

            let currentPickTaskAssignee = childEle.children[4].innerText.trim();
            let currentPickTaskUnits = parseInt(childEle.children[6].querySelector("div[role=\"progressbar\"]").ariaValueMax);
            let currentPickTaskType = getPickTaskType(childEle.children[7]);
            let currentPickTaskOrders = parseInt(childEle.children[8].querySelector("div[role=\"progressbar\"]").ariaValueMax);
            
    
            if (currentPickTaskAssignee === "") {
                currentPickTaskAssignee = "unassigned";
            };
            
            if (!(currentPickTaskAssignee in assignedByName)) {
    
                assignedByName[currentPickTaskAssignee] = {
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
                };
            }
    
            let currentAssignee = assignedByName[currentPickTaskAssignee];
            
            currentAssignee[currentPickTaskType].pickTasks ++;
            currentAssignee[currentPickTaskType].units += currentPickTaskUnits;
            currentAssignee[currentPickTaskType].orders += currentPickTaskOrders;

            
            
        }

        const nextPageButton = document.querySelector(".flex-icon.fa.fa-angle-double-right");
        if (dataFound || outOfData || (!nextPageButton)) {

            jsonToCVS(assignedByName, "past-productivity-report");

            chrome.storage.sync.remove(["PAST-ASSIGNED-BY-NAME", "FETCHING-PRODUCTIVITY-REPORT-DATA", "DATE-TO-FETCH-PRODUCTIVITY-REPORT-AFTER", "DATE-TO-FETCH-PRODUCTIVITY-REPORT-BEFORE"], function(){
                var error = chrome.runtime.lastError;
                if (error) {
                    console.log(error);
                }
            })

        } else {

            chrome.storage.sync.set({
                ["PAST-ASSIGNED-BY-NAME"]: JSON.stringify(assignedByName),
                ["FETCHING-PRODUCTIVITY-REPORT-DATA"]: JSON.stringify(true)
            })
            .then(() => {
                nextPageButton.click()
            });

        }
        
    
    };


    if (fetchingProductivityReportData && timeToFetchAfter && timeToFetchBefore) {

        chrome.storage.sync.set({
            ["FETCHING-PRODUCTIVITY-REPORT-DATA"]: JSON.stringify(false)
        })
        .then(fetchAllPickTaskInfo);

    };   
    
})();



(async () => {
    const src = chrome.runtime.getURL("./js/utils/utils.js");
    const contentMain = await import(src);

    contentMain.fetchFromChromeStorage("PA_VIEW_ENABLED", false)
    .then(settingState => {
        
       if (settingState) {
        displayPickTaskQuantityOnPrint();
       } 
    }) 

    

    /**
     * Functions adds the quantity of units to the pickTask sheet.
     *  
     */
    const displayPickTaskQuantityOnPrint = async () => {
        const urlParams = location.href.split("/");
        const pickTaskQuantity = await fetchPickTaskAmount(urlParams[6]);
        addPickTaskQuantityOnPrint(pickTaskQuantity);
    };



    /**
     * 
     * Functions fetches pickTask data and returns it's quantity of units to pick.
     * 
     * @param {string} pickTaskId - id of the pick task
     * @returns 
     */
    const fetchPickTaskAmount = (pickTaskId) => {
        return new Promise(async resolve => {
            const response = await fetch("https://dropship.amazon.com/web/ajax/picktasks/getPickTaskById?pickTaskId="+pickTaskId);
          
            if (!response.ok) {
                resolve(undefined);
            }

            const pickTaskData = await response.json();
            
            resolve(pickTaskData?.pickTask?.totalQuantity);
        })
        
    };




    /**
     * 
     * Functions added the number in the parameter on the pick tasks sheet.
     * 
     * @param {number} pickTaskQuantity 
     */
    const addPickTaskQuantityOnPrint = (pickTaskQuantity) => {
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
    
})();
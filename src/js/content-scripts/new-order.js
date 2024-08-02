(async () => {
    const src = chrome.runtime.getURL("./js/utils/utils.js");
    const contentMain = await import(src);
    const createElementWithId = contentMain.createElementWithId;

    contentMain.fetchFromChromeStorage("PA_VIEW_ENABLED", false)
    .then(settingState => {

       if (settingState) {

        // code to displaying selected product image below.

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

                        const product = data.product;
                        
                        if (!document.getElementById("selected-img-display")) {
                            const newElement = createElementWithId("div", "selected-img-display");
                            newElement.setAttribute("style", "width: 100%; margin: 0 auto;")
                            batchInfoContainer.appendChild(newElement);
                        }

                        const imgDisplayElement = document.getElementById("selected-img-display");
                        imgDisplayElement.innerHTML = "";

                        const weightClassToColor = {
                            "LIGHT": "bc-success",
                            "MEDIUM": "bc-warning",
                            "HEAVY": "bc-danger",
                            "N/A": "bc-secondary"
                        };

                        const sizeClassToColor = {
                            "SMALL": "bc-success",
                            "MEDIUM": "bc-warning",
                            "LARGE": "bc-danger",
                            "X-LARGE": "bc-danger",
                            "N/A": "bc-secondary"
                        };

                        const productWeightClass = getWeightClass(product.weightWithUnit.weight);
                        const productSizeClass = getSizeClass(product.widthWithUnit.length, product.heightWithUnit.length, product.lengthWithUnit.length);

                        const productDetails = [
                            ["Weight:", product.weightWithUnit.weight.toFixed(1) + " " + product.weightWithUnit.unitOfMeasure, weightClassToColor[productWeightClass] + " color-light"],
                            ["Size Class:", productSizeClass, sizeClassToColor[productSizeClass]  + " color-light"],
                            ["Title:", product.title, "color-dark"]
                        ];

                        const tableElement = document.createElement("table");
                        tableElement.setAttribute("class", "product-display-table text-xs");

                        let currentRow = document.createElement("tr");
                        let currentCell = document.createElement("th");
                        currentCell.setAttribute("class", "text-center");
                        currentCell.innerText = "- SELECTED PRODUCT -";
                        currentRow.appendChild(currentCell);
                        tableElement.appendChild(currentRow);

                        currentRow = document.createElement("tr");
                        currentCell = document.createElement("td");

                        const productImageElement = document.createElement("img");
                        productImageElement.src = product.imageURL;
                        productImageElement.alt = "Product Image";
                        productImageElement.setAttribute("class", "w-75");
                        currentCell.appendChild(productImageElement);

                        currentRow.appendChild(currentCell);
                        tableElement.appendChild(currentRow);



                        for (let [title, info, classNames] of productDetails) {
                            currentRow = document.createElement("tr");

                            currentCell = document.createElement("th");
                            currentCell.setAttribute("class", "text-center");
                            currentCell.innerText = title;
                            currentRow.appendChild(currentCell);

                            tableElement.appendChild(currentRow);

                            currentRow = document.createElement("tr");

                            currentCell = document.createElement("td");
                            currentCell.innerText = info;
                            currentCell.setAttribute("class", classNames + " text-center font-b");
                            currentRow.appendChild(currentCell);


                            tableElement.appendChild(currentRow);
                        };

                        imgDisplayElement.appendChild(tableElement);
    
                    }
                })
                .catch((response) => {
                    console.log(response);
                })
            
        };
    
        const config = { attributes: true };
    
        const observer = new MutationObserver(callback);
    
        observer.observe(hiddenFnskuElement, config);
        
        callback();
        
       }
    }) 





    /**
     * Function returns weight class as string for given number.
     * 
     * @param {number} weight 
     * @returns 
     */
    const getWeightClass = (weight) => {

        if (!weight) {
            return "N/A";
        }

        if (15 <= weight) {
            return "HEAVY";
        } else if (weight <= 6) {
            return "LIGHT";
        }
        return  "MEDIUM";
    }


    /**
     * Function returns a string representing size class of a product. Weight class is
     * based on the volume of the product which requires length, wight and height of the product.
     * 
     * @param {number} length 
     * @param {number} width 
     * @param {number} height 
     * @returns 
     */
    const getSizeClass = (length, width, height) => {

        if (!(length && width && height)) {
            return "N/A";
        }

        const volume = length * width * height;

        if (volume >= 3100) {
            return "X-LARGE";
        } else if (volume >= 2500) {
            return "LARGE";
        } else if (volume >= 1500) {
            return "MEDIUM";
        } 
        
        return  "SMALL";
    }


})();
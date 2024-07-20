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
                        productImageCaptionElement.innerHTML = "<strong>Selected Product: </strong><br>" + data.product.title;
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
        
        callback();
        
       }
    }) 
})();
/**
 * Returns current active tab
 */
export async function getActiveTabURL() {
    return (await chrome.tabs.query({active: true, currentWindow: true}))[0];
}



/**
 * 
 * Fetches data from chrome sync storage by key and returns the value.
 * 
 * @param {string} key - Key value to fetch from chrome storage
 * @param {any} defaultResponse - Response if value not found (set to undefined by default)
 * @returns {Promise} - fetched data | default response
 */
export async function fetchFromChromeStorage(key, defaultResponse=undefined) {
    return new Promise((resolve) => {
        chrome.storage.sync.get([key], (obj) => {
            resolve(obj[key] ? JSON.parse(obj[key]) : defaultResponse);
        });
    });
};



/**
 * 
 * Returns hash of a string. (max first 50 characters hash).
 * 
 * @param {string} str 
 * @returns {number} - hashed string value
 */
export function stringToHash(str) {
    let hash = 0;

    if (!str) {
        return hash;
    }

    for  (let i=0; i<Math.min(str.length, 50); i++) {
        hash = str.charCodeAt(i) + ((hash << 5) + hash)
    }

    return hash;
};


/**
 * 
 * Functions compares date provided as string and returns true is first parameter is smaller 
 * then the second otherwise returns false.
 * 
 * (string date should be formatted as "yyyy/mm/dd")
 * 
 * 
 * @param {string} stringDate1 -> "yyyy/mm/dd"
 * @param {string} stringDate2 -> "yyyy/mm/dd"
 * @returns 
 */
export function dateIsLessThen(stringDate1, stringDate2) {
    let date1 = new Date(stringDate1).getTime();
    let date2 = new Date(stringDate2).getTime();

    return (date1 < date2);
}


/**
 * 
 * Generates and returns input strings color value by hashing it 
 * and converting the hash into a hex color value.
 * 
 * @param {string} str
 * @returns {string} - hex color value
 */
export function stringToColor(str) {

    let hash = stringToHash(str);

    let color = '#'
    for (let i = 0; i < 3; i++) {
      color += ((hash >> (i * 8)) & 0xff).toString(16).padStart(2, '0')
    }
    return color
}



/**
 * 
 * Creates an HTML element sets it's id and returns it.
 * 
 * @param {string} elementType 
 * @param {string} elementId 
 * @returns 
 */
export function createElementWithId(elementType, elementId) {
    var newElement = document.createElement(elementType);
    newElement.id = elementId;
    return newElement;
}

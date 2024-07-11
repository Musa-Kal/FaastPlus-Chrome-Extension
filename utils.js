export async function getActiveTabURL() {
    return (await chrome.tabs.query({active: true, currentWindow: true}))[0];
}


export async function fetchFromChromeStorage(key, defaultResponse=[]) {
    return new Promise((resolve) => {
        chrome.storage.sync.get([key], (obj) => {
            resolve(obj[key] ? JSON.parse(obj[key]) : defaultResponse);
        });
    });
};



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



// Only secrets below ;)

const PA_VIEW_PASSWORD_HASH = -3693763462; // Just for fun 

export { PA_VIEW_PASSWORD_HASH };

export async function getActiveTabURL() {
    return (await chrome.tabs.query({active: true, currentWindow: true}))[0];
}

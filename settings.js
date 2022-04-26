// TODO: make options for tokens
function saveOptions(e) {
    browser.storage.sync.set({
        token: document.querySelector("#token").value
    });
    restoreOptions()
    e.preventDefault();
}

function restoreOptions() {
    var storageItem = browser.storage.sync.get('token');
    storageItem.then((res) => {
        document.querySelector("#value-token").innerText = res.token;
        document.querySelector("#token").value = res.token || '';
    });

}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
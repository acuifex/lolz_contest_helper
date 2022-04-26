function listener(details) {
    let filter = browser.webRequest.filterResponseData(details.requestId);
    let decoder = new TextDecoder("utf-8");
    let encoder = new TextEncoder();

    filter.ondata = event => {
        let str = decoder.decode(event.data);
        console.log(details)
        console.log(str)

        browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
            browser.tabs.sendMessage(tabs[0].id, {request:details, response:JSON.parse(str)});
        });

        filter.write(encoder.encode(str));
        filter.disconnect();
    }

    filter.onstop = event => {
        filter.close();
    }

    //return {}; // not needed
}

browser.webRequest.onBeforeRequest.addListener(
    listener,
    {urls: ["https://lolz.guru/threads/*/participate"]},
    ["blocking", "requestBody"]
);
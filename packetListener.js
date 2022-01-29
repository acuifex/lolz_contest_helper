/* function listener(details) {
    let filter = chrome.webRequest.filterResponseData(details.requestId);
	console.log(details);
    let decoder = new TextDecoder("utf-8");
    let encoder = new TextEncoder();

    filter.ondata = event => {
        let str = decoder.decode(event.data);
        console.log(details)
        console.log(str)

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {request:details, response:JSON.parse(str)});
        });

        filter.write(encoder.encode(str));
        filter.disconnect();
    }

    filter.onstop = event => {
        filter.close();
    }

    //return {}; // not needed
}
*/
// web programming sucks. i'm like 99% sure that this creates a memory leak.
// chrome.webRequest.onBeforeRequest.addListener(
    // listener,
    // {urls: ["https://lolz.guru/threads/*/participate"]},
    // ["blocking", "requestBody"]
// );
 
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
		console.log(request)
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {request:request.req, response:request.res});
        });
	});

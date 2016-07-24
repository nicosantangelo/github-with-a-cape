chrome.runtime.onInstalled.addListener(function(details){
  if(details.reason == "install") {
    var OPTIONS_URL = chrome.extension.getURL('options/options.html')
    chrome.tabs.create({ url: OPTIONS_URL })
  }
})

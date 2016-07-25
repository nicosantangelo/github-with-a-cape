chrome.runtime.onInstalled.addListener(function(details) {
    if(details.reason === 'install' || details.reason === 'update') {
      var OPTIONS_URL = chrome.extension.getURL('options/options.html')
      chrome.storage.local.set({ justUpdated: true }, function () {
        chrome.tabs.create({ url: OPTIONS_URL })
      })
    }
})

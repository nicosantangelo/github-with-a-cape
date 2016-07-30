chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason !== 'install' && details.reason !== 'update') return

  var options = {}

  if(details.reason === 'install') {
    options['firstInstall'] = true
  }

  if(details.reason === 'update') {
    options['justUpdated'] = 2
  }

  chrome.storage.local.set(options, function () {
    var OPTIONS_URL = chrome.extension.getURL('options/options.html')
    chrome.tabs.create({ url: OPTIONS_URL })
  })
})

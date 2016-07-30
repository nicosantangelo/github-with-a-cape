;(function () {
  var DEFAULT_CONFIGURATION = {
    showOutdatedComments   : true,
    showCurrentDiffFileName: true,
    collapsableDiffs       : true,
    showallHideAllButtons  : true,
    collapsableCommits     : true
  }

  var configuration = {
    DEFAULT: DEFAULT_CONFIGURATION,

    forEachDefault: function(callback) {
      for(var prop in DEFAULT_CONFIGURATION) {
        callback(prop, DEFAULT_CONFIGURATION[prop])
      }
    },

    get: function(callback) {
      chrome.storage.sync.get(DEFAULT_CONFIGURATION, callback)
    },

    set: function(values, callback) {
      chrome.storage.sync.set(values, callback)
    },

    onChanged: function(callback) {
      chrome.storage.onChanged.addListener(function(changes, namespace) {
        callback(changes)
      })
    },

    forEachCurrent: function(callback) {
      configuration.get(function (config) {
        for(var prop in config) {
          callback(prop, config[prop])
        }
      })
    }
  }

  window.configuration = configuration
})()

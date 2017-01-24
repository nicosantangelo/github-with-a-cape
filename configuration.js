;(function () {
  var DEFAULT_CONFIGURATION = {
    showOutdatedComments      : false,
    highlightOutdatedDiffIcons: false,
    showCurrentDiffFileName   : true,
    collapsableDiffs          : true,
    showHideAllButtons        : true,
    collapsableCommits        : true,
    toggleContributions       : true,
    resizeableSplittedDiffs   : true,
    notifications             : false
  }
  var storage = chrome.storage

  var configuration = {
    DEFAULT: DEFAULT_CONFIGURATION,

    forEachDefault: function(callback) {
      for(var prop in DEFAULT_CONFIGURATION) {
        callback(prop, DEFAULT_CONFIGURATION[prop])
      }
    },

    get: function(key, callback) {
      if (typeof key === 'function') {
        callback = key
        storage._sync.get(DEFAULT_CONFIGURATION, callback)
      } else {
        storage._sync.get(key, function(result) {
          callback(result[key])
        })
      }
    },

    set: function(values, callback) {
      storage._sync.set(values, callback)
    },

    onChanged: function(callback) {
      storage.onChanged.addListener(function(changes, namespace) {
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

  // Patch chrome.storage to use local if sync it's not supported (Firefox)
  storage._sync = storage.sync ? storage.sync : storage.local

  window.configuration = configuration
})()

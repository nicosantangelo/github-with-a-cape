/* Globals: configuration */

;(function() {
  var saveTimeout
  var notice = document.getElementById('notice')
  var elements = {}

  configuration.forEachDefault(function (key, value) {
    elements[key] = document.getElementById(key)
  })
  

  // -----------------------------------------------------------------------------
  // Events

  document.getElementById('save').addEventListener('click', function save() {
    var newValues = { }

    configuration.forEachDefault(function (key, value) {
      newValues[key] = elements[key].checked
    })

    configuration.set(newValues, function () {
      notice.classList.remove('hidden')
      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(function () { notice.classList.add('hidden') }, 4000)
    })
  }, false)


  var closeButtons = document.getElementsByClassName('close-notice')
  Array.prototype.forEach.call(closeButtons, function(closeButton) {
    closeButton.addEventListener('click', function() {
      closeButton.parentElement.classList.add('hidden')
    }, false)
  })


  // -----------------------------------------------------------------------------
  // Start

  chrome.storage.local.get({ justUpdated: false }, function(items) {
    if (items.justUpdated) {
      document.getElementById('first-use-notice').classList.remove('hidden')
      chrome.storage.local.remove('justUpdated')
    }
  })

  configuration.forEachCurrent(function(key, value) {
    elements[key].checked = value
  })
})()

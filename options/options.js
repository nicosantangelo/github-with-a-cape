/* Globals: configuration */

;(function() {
  var saveTimeout
  var notice = document.getElementById('notice')
  var notificationsAccessToken = document.getElementById('notifications-access-token')
  var elements = {}

  configuration.forEachDefault(function (key, value) {
    elements[key] = document.getElementById(key)
  })

  configuration.get('notificationAccessToken', function(token) {
    notificationsAccessToken.value = token || ''
  })
  

  // -----------------------------------------------------------------------------
  // Events

  document.getElementById('save').addEventListener('click', function save() {
    var newValues = { }

    configuration.forEachDefault(function (key, value) {
      newValues[key] = elements[key].checked
    })

    newValues['notificationAccessToken'] = notificationsAccessToken.value

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

  chrome.storage.local.get({ firstInstall: false, justUpdated: 0 }, function(items) {
    if (items.firstInstall) {
      document.getElementById('first-use-notice').classList.remove('hidden')
      chrome.storage.local.remove(['firstInstall', 'justUpdated'])
    }

    if (items.justUpdated > 0) {
      var newItems = document.getElementsByClassName('new')

      for(var i = 0; i < newItems.length; i++) {
        newItems[i].classList.remove('hidden')
      }

      items.justUpdated -= 1

      chrome.storage.local.set({ justUpdated: items.justUpdated })
    }
  })

  configuration.forEachCurrent(function(key, value) {
    elements[key].checked = value
  })
})()

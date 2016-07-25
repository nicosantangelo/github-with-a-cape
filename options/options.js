(function() {
  var DEFAULT_CONFIGURATION = {
    SHOW_OUTDATED_COMMENTS: true,
    SHOW_CURRENT_FILE_NAME: true,
    COLLAPSABLE_DIFFS     : true
  }

  var showOutdatedCommentsEl    = document.getElementById('show-outdated-comments')
  var showCurrentDiffFileNameEl = document.getElementById('show-current-diff-file-name')
  var collapsableDiffsEl        = document.getElementById('collapsable-diffs')

  var notice = document.getElementById('notice')

  var saveTimeout

  // -----------------------------------------------------------------------------
  // Events

  document.getElementById('save').addEventListener('click', function save() {
    var configuration = {
      SHOW_OUTDATED_COMMENTS: showOutdatedCommentsEl.checked,
      SHOW_CURRENT_FILE_NAME: showCurrentDiffFileNameEl.checked,
      COLLAPSABLE_DIFFS     : collapsableDiffsEl.checked
    }

    console.log(configuration)

    chrome.storage.sync.set(configuration, function() {
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

  chrome.storage.sync.get(DEFAULT_CONFIGURATION, function(configuration) {
    showOutdatedCommentsEl.checked    = configuration.SHOW_OUTDATED_COMMENTS
    showCurrentDiffFileNameEl.checked = configuration.SHOW_CURRENT_FILE_NAME
    collapsableDiffsEl.checked        = configuration.COLLAPSABLE_DIFFS
  })
})()

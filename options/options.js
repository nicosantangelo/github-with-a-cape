(function() {
  var DEFAULT_CONFIGURATION = {
    SHOW_OUTDATED_COMMENTS: false,
    SHOW_CURRENT_DIFF_NAME: false,
    COLLAPSABLE_DIFFS     : false
  }

  var showOutdatedCommentsEl    = document.getElementById('show-outdated-comments')
  var showCurrentDiffFileNameEl = document.getElementById('show-current-diff-file-name')
  var collapsableDiffsEl        = document.getElementById('collapsable-diffs')

  var saveTimeout

  function save() {
    var configuration = {
      SHOW_OUTDATED_COMMENTS: showOutdatedCommentsEl.checked,
      SHOW_CURRENT_DIFF_NAME: showCurrentDiffFileNameEl.checked,
      COLLAPSABLE_DIFFS     : collapsableDiffsEl.checked
    }

    localStorage["configuration"] = JSON.stringify(configuration)

    var notice = document.getElementById('notice')
    notice.classList.remove('hidden')

    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(function () {
      notice.classList.add('hidden')
    }, 10000)
  }

  function loadCurrentOptions() {
    var configuration = {}

    try {
      configuration = Object.assign({}, DEFAULT_CONFIGURATION, JSON.parse(localStorage["configuration"]))
    }
    catch (err) {
      console.warn("Problem loading saved configuration: " + err)
      configuration = DEFAULT_CONFIGURATION
    }

    showOutdatedCommentsEl.checked    = configuration.SHOW_OUTDATED_COMMENTS
    showCurrentDiffFileNameEl.checked = configuration.SHOW_CURRENT_DIFF_NAME
    collapsableDiffsEl.checked        = configuration.COLLAPSABLE_DIFFS
  }

  if (! localStorage["hideFirstUseNotice"]) {
    document.getElementById('first-use-notice').classList.remove('hidden')
    localStorage["hideFirstUseNotice"] = true
  }

  document.getElementById('save').addEventListener('click', save, false)

  var closeButtons = document.getElementsByClassName('close-notice')
  Array.prototype.forEach.call(closeButtons, function(closeButton) {
    closeButton.addEventListener('click', function() {
      closeButton.parentElement.classList.add('hidden')
    }, false)
  })
  loadCurrentOptions()
})()
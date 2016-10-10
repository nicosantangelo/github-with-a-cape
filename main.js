(function() {
  var forEachButton = function(fn) {
    var buttons = document.getElementsByClassName('get-it')
    for (var i = 0; i < buttons.length; i++) {
      fn(buttons[i])
    }
  }

  if (chrome.app.isInstalled) {
    forEachButton(function(button) {
      button.innerHTML = 'VIEW IN WEBSTORE'
    })
  } else {
    var inlineInstall = function(event) {
      var url = event.target.href

      chrome.webstore.install(url, function success() {}, function error() {
        window.location = url
      })

      ga('send', 'event', 'Button', 'click', 'Install')
      event.preventDefault()
    }

    forEachButton(function(button) {
      button.addEventListener('click', inlineInstall, true)
    })
  }
})()

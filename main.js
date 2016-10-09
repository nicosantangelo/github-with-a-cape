(function() {
  var buttons = document.getElementsByClassName('get-it')

  if (chrome.app.isInstalled) {
    buttons[0].style.visibility = 'hidden'
    buttons[1].innerHTML = 'Webstore'
  } else {
    var inlineInstall = function(event) {
      var url = event.target.href

      chrome.webstore.install(url, function success() {
      }, function error() {
        window.location = url
      })
      event.preventDefault()
    }

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', inlineInstall, true)
    }
  }
})()

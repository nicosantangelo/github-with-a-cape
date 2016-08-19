/* Globals: configuration */

(function() {
  var NOTIFICATIONS_HTML = chrome.extension.getURL('notifications.html')
  var API_URL = null
  var lastRequest = {
    lastModified: '',
    text: ''
  }

  getApiURL(function(url) { API_URL = url })

  window.notifications = {
    start: function() {
      http({ method: 'GET', url: NOTIFICATIONS_HTML }, function(modalHTML) {
        appendModal(modalHTML)

        var indicator = document.querySelector("#user-links .notification-indicator")
        indicator.classList.remove('tooltipped-s')
        indicator.classList.add('tooltipped-w')

        var modal = document.getElementById('__ghcape-modal')
        modal.style.left = (indicator.offsetLeft + indicator.offsetWidth - 300) + "px"

        indicator.addEventListener('click', function(event) {
          if (event.which === 2) return // 'Middle' mouse click

          event.preventDefault()
          indicator.blur()

          if (modal.classList.contains('hidden')) {
            modal.classList.remove('hidden')
            document.body.addEventListener('click', hideNotificationsModalOnOutsideClick)
            requestNotifications()
          } else {
            modal.classList.add('hidden')
            document.body.removeEventListener('click', hideNotificationsModalOnOutsideClick)
          }
        }, true)

        document.getElementById('__ghcape-mark-as-read').addEventListener('click', readNotifications, true)
      })
    }
  }

  function appendModal(modalHTML) {
    var modalContainer = document.createElement('div')
    modalContainer.innerHTML = modalHTML
    document.body.appendChild(modalContainer)
  }

  function requestNotifications() {
    setEmptyNotificationsNotice('Loading...')

    http({
      method: 'GET',
      url: API_URL,
      headers: { 'If-Modified-Since': lastRequest.lastModified }
    }, function(responseText, fullResponse) {
      lastRequest.lastModified = fullResponse.getResponseHeader('Last-Modified') || lastRequest.lastModified
      
      var text = responseText === ''
        ? lastRequest.text
        : responseText

      renderNotifications(text, fullResponse)
      lastRequest.text = text
    })
  }

  function renderNotifications(notificationsText, fullResponse) {
    var linkheader = fullResponse.getResponseHeader('Link')
    var notifications = JSON.parse(notificationsText)
    var notificationsList = ''

    if (notifications.length > 0) {
      var modal = document.getElementById('__ghcape-modal')

      var iconsHTML = {
        pull   : modal.querySelector('.octicon-git-pull-request').outerHTML,
        issues : modal.querySelector('.octicon-issue-opened').outerHTML,
        commits: modal.querySelector('.octicon-git-commit').outerHTML
      }

      notificationsList = buildNotificationsListHTML(notifications, iconsHTML)

      if (linkheader) {
        notificationsList.push('<li style="text-align:center;"><a href="/notifications">See all</a></li>')
      }

      document.getElementById('__ghcape-notifications-list').innerHTML = notificationsList.join('\n')
    } else {
      setEmptyNotificationsNotice()
    }
  }

  function buildNotificationsListHTML(notifications, iconsHTML) {
    return notifications.map(function(notification) {
      var subject = notification.subject

      var resourceId = subject.url.split('/').slice(-1)
      var type = { Issue: 'issues', PullRequest: 'pull', Commit: 'commits' }[subject.type]

      var url = notification.repository.html_url + '/' + type + '/' + resourceId
      var title = escapeHTML(subject.title)

      var link = '<a href="' + url + '" data-id="' + notification.id + '">' + iconsHTML[type] + title + '</a>'

      return '<li>' + link + '</li>'
    })
  }

  function readNotifications(event) {
    getApiURL(function(url) {
      http({
        method: 'PUT',
        url: url,
        data: { read: true }
      }, setEmptyNotificationsNotice.bind('No new notifications'))
    })
  }

  function hideNotificationsModalOnOutsideClick(event) {
    // Take the less reliable but more efficient route
    var classes = event.target.classList + " " + event.target.parentElement.classList
    var notificationClasses = /notification-indicator|octicon-bell/
    var clickedOnNotifications = classes.search(notificationClasses) !== -1

    if (! clickedOnNotifications) {
      var modal = document.getElementById('__ghcape-modal')
      modal.classList.add('hidden')
    }
  }

  // -----------------------------------------------------------------------------
  // Utils

  function http(options, success, error) {
    var xmlhttp = new XMLHttpRequest()

    xmlhttp.onreadystatechange = function(result) {
      if (xmlhttp.readyState === 4) {
        if(xmlhttp.status >= 400) {
          error && error(xmlhttp.responseText, xmlhttp)
        } else {
          success(xmlhttp.responseText, xmlhttp)
        }
      }

    }

    xmlhttp.open(options.method, options.url, true)

    if (options.headers) {
      for(var header in options.headers) {
        xmlhttp.setRequestHeader(header, options.headers[header])
      }
    }

    xmlhttp.send(JSON.stringify(options.data))
  }

  function getApiURL(callback) {
    configuration.get('notificationAccessToken', function(token) {
      if (token) {
        callback('https://api.github.com/notifications?access_token=' + token)
      }
    })
  }

  function setEmptyNotificationsNotice(text) {
    document.getElementById('__ghcape-notifications-list').innerHTML = '<li class="__ghcape-empty">' + text + '</li>'
  }

  function escapeHTML(html) {
    return html.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/>/g, '&gt;').replace(/</g, '&lt;')
  }

})()
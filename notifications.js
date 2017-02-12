/* Globals: configuration */

(function() {
  var LOADED = false
  var NOTIFICATIONS_HTML = chrome.extension.getURL('notifications.html')
  var API_URL = null

  var lastRequest = {
    lastModified: '',
    text: ''
  }

  getApiURL(function(url) { API_URL = url })

  window.notifications = {
    load: function() {
      if (! LOADED) {
        LOADED = true
        notifications.start()
      }
    },

    start: function() {
      http({ method: 'GET', url: NOTIFICATIONS_HTML }, function(modalHTML) {
        var indicator = document.querySelector('#user-links .notification-indicator')
        indicator.classList.remove('tooltipped-s')
        indicator.classList.add('tooltipped-w')

        appendModal(indicator.parentElement, modalHTML)

        var modal = document.getElementById('__ghcape-modal')

        indicator.addEventListener('click', function(event) {
          if (event.which === 2) return // 'Middle' mouse click

          event.preventDefault()
          indicator.blur()

          if (modal.classList.contains('__ghcape-hidden')) {
            modal.classList.remove('__ghcape-hidden')
            document.body.addEventListener('click', hideNotificationsModalOnOutsideClick)
            requestNotifications()
          } else {
            modal.classList.add('__ghcape-hidden')
            document.body.removeEventListener('click', hideNotificationsModalOnOutsideClick)
          }
        }, true)

        document.getElementById('__ghcape-mark-as-read').addEventListener('click', readNotifications, true)
      })
    }
  }


  function appendModal(container, modalHTML) {
    var modal = document.createElement('div')
    modal.innerHTML = modalHTML

    container.style.position = 'relative'
    container.appendChild(modal)
  }

  function requestNotifications() {
    setEmptyNotificationsNotice('Loading...')

    http({
      method: 'GET',
      url: API_URL,
      headers: { 'If-Modified-Since': lastRequest.lastModified }
    }, function(responseText, fullResponse) {
      lastRequest.lastModified = fullResponse.getResponseHeader('Last-Modified') || lastRequest.lastModified

      var text = '[]'

      if (newNotificationsBadgeVisible()) {
        text = responseText === '' ? lastRequest.text : responseText
      }

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
        pull  : modal.querySelector('.octicon-git-pull-request').outerHTML,
        issues: modal.querySelector('.octicon-issue-opened').outerHTML,
        commit: modal.querySelector('.octicon-git-commit').outerHTML,
        invite: modal.querySelector('.octicon-mail').outerHTML
      }

      notificationsList = buildNotificationsListHTML(notifications, iconsHTML)

      if (linkheader) {
        notificationsList.push('<li style="text-align:center;"><a href="/notifications">See all</a></li>')
      }

      document.getElementById('__ghcape-notifications-list').innerHTML = notificationsList.join('\n')
    } else {
      setEmptyNotificationsNotice('No new notifications')
    }
  }

  function buildNotificationsListHTML(notifications, iconsHTML) {
    return notifications.map(function(notification) {
      var subject = notification.subject

      var type = {
        Issue: 'issues',
        PullRequest: 'pull',
        Commit: 'commit',
        RepositoryInvitation: 'invite'
      }[subject.type]

      var url = notification.repository.html_url
      var title = escapeHTML(subject.title)

      if (subject.url) {
        var resourceId = subject.url.split('/').slice(-1)
        url += '/' + type + '/' + resourceId
      }

      var icon = iconsHTML[type] || ''

      return '<li><a href="' + url + '" data-id="' + notification.id + '">' + icon + title + '</a></li>'
    })
  }

  function readNotifications(event) {
    http({
      method: 'PUT',
      url: API_URL,
      data: { read: true }
    }, setEmptyNotificationsNotice.bind(null, 'No new notifications'))

    event.target.parentElement.parentElement.blur() // wat
    event.stopPropagation()
  }

  function hideNotificationsModalOnOutsideClick(event) {
    // Take the less reliable but more efficient route just to avoid traversing the DOM tree
    var target = event.target
    var parent = target.parentElement
    var selector = target.classList + " " + parent.classList + " " + parent.parentElement.id

    var notificationClasses = /notification-indicator|octicon-bell|__ghcape-notifications-list/

    var clickedOnNotifications = selector.search(notificationClasses) !== -1

    if (! clickedOnNotifications) {
      var modal = document.getElementById('__ghcape-modal')
      modal.classList.add('__ghcape-hidden')
    }
  }

  function newNotificationsBadgeVisible() {
    return !! document.querySelector('.notification-indicator .mail-status.unread')
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

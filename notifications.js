/* Globals: configuration */

(function() {
  var NOTIFICATIONS_HTML = chrome.extension.getURL('notifications.html')

  window.notifications = {
    start: function() {
      getApiURL(renderNotifications)
    }
  }

  function renderNotifications(url) {
    http({ method: 'GET', url: NOTIFICATIONS_HTML }, function(modalHTML) {
      var div = document.createElement('div')
      div.innerHTML = modalHTML
      document.body.appendChild(div)

      http({ method: 'GET', url: url }, appendNotifications)
    })
  }

  function appendNotifications(notificationsResponse, response) {
    var linkheader = response.getResponseHeader('Link')

    var indicator = document.querySelector("#user-links .notification-indicator")
    indicator.classList.remove('tooltipped-s')
    indicator.classList.add('tooltipped-w')

    var modal = document.getElementById('__ghcape-modal')
    modal.style.left = (indicator.offsetLeft + indicator.offsetWidth - 300) + "px"

    var notifications = JSON.parse(notificationsResponse)
    var notificationsList = ''

    if (notifications.length > 0) {
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


    document.getElementById('__ghcape-mark-as-read').addEventListener('click', readNotifications, true)

    indicator.addEventListener('click', function(event) {
      // 'Middle' mouse click
      if (event.which === 2) return

      event.preventDefault()
      
      indicator.blur()

      if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden')
        document.body.addEventListener('click', hideNotificationsModalOnOutsideClick)
      } else {
        modal.classList.add('hidden')
        document.body.removeEventListener('click', hideNotificationsModalOnOutsideClick)
      }
    }, true)
  }

  function buildNotificationsListHTML(notifications, iconsHTML) {
    return notifications.map(function(notification) {
      let subject = notification.subject

      let resourceId = subject.url.split('/').slice(-1)
      let type = { Issue: 'issues', PullRequest: 'pull', Commit: 'commits' }[subject.type]

      let url = notification.repository.html_url + '/' + type + '/' + resourceId

      let link = '<a href="' + url + '" data-id="' + notification.id + '">' + iconsHTML[type] + subject.title + '</a>'

      return '<li>' + link + '</li>'
    })
  }

  function readNotifications(event) {
    getApiURL(function(url) {
      http({
        method: 'PUT',
        url: url,
        data: { read: true }
      }, setEmptyNotificationsNotice)
    })
  }

  function hideNotificationsModalOnOutsideClick(event) {
    // Take the less reliable but more efficient route
    var targetClassList = event.target.classList
    var parentClassList = event.target.parentElement.classList
    var clickedOnNotifications = targetClassList.contains('notification-indicator') || parentClassList.contains('octicon-bell')

    var modal = document.getElementById('__ghcape-modal')

    if (! clickedOnNotifications) {
      modal.classList.add('hidden')
    }
  }

  // -----------------------------------------------------------------------------
  // Utils

  function http(options, success, error) {
    var xmlhttp = new XMLHttpRequest()

    xmlhttp.onreadystatechange = function(result) {
      if (xmlhttp.readyState === 4) {
        if(xmlhttp.status >= 300) {
          error && error(xmlhttp.responseText, xmlhttp)
        } else {
          success(xmlhttp.responseText, xmlhttp)
        }
      }

    }

    xmlhttp.open(options.method, options.url, true)
    xmlhttp.send(JSON.stringify(options.data))
  }

  function getApiURL(callback) {
    configuration.get('notificationAccessToken', function(token) {
      if (token) {
        callback('https://api.github.com/notifications?access_token=' + token)
      }
    })
  }

  function setEmptyNotificationsNotice() {
    document.getElementById('__ghcape-notifications-list').innerHTML = '<li class="__ghcape-empty">No new notifications</li>'
  }

})()
/* Globals: configuration */

(function() {
  var NOTIFICATIONS_HTML = chrome.extension.getURL('notifications.html')

  window.notifications = {
    start: function() {
      getApiURL(renderNotifications)
    }
  }

  function renderNotifications(url) {
    httpGet(NOTIFICATIONS_HTML, function(modalHTML) {
      var div = document.createElement('div')
      div.innerHTML = modalHTML
      document.body.appendChild(div)

      httpGet(url, appendNotifications)
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
    } else {
      notificationsList = ['<li style="text-align:center;">No new notifications</li>']
    }

    document.getElementById('__ghcape-notifications-list').innerHTML = notificationsList.join('\n')

    indicator.addEventListener('click', function(event) {
      indicator.blur()
      modal.classList.toggle('hidden')
      event.preventDefault()
    }, true)
  }

  function buildNotificationsListHTML(notifications, iconsHTMl) {
    return notifications.map(function(notification) {
      let subject = notification.subject

      let resourceId = subject.url.split('/').slice(-1)
      let type = { Issue: 'issues', PullRequest: 'pull', Commit: 'commits' }[subject.type]

      let url = notification.repository.html_url + '/' + type + '/' + resourceId

      let link = '<a href="' + url + '">' + iconsHTML[type] + subject.title + '</a>'

      return '<li>' + link + '</li>'
    })
  }

  // -----------------------------------------------------------------------------
  // Utils

  function httpGet(url, callback, headers) {
    var xmlhttp = new XMLHttpRequest()

    xmlhttp.onreadystatechange = function(result) {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        callback(xmlhttp.responseText, xmlhttp)
      }
    }

    xmlhttp.open('GET', url, true)
    xmlhttp.send()
  }

  function getApiURL(callback) {
    configuration.get('notificationAccessToken', function(token) {
      if (token) {
        callback('https://api.github.com/notifications?access_token=' + token)
      }
    })
  }
})()
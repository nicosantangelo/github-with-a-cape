/* Globals: configuration */

;(function () {
  'use strict'

  var config = {}

  var urlObserver = new window.MutationObserver(function(mutations, observer) {
    setTimeout(main)
  })

  urlObserver.observe(document.getElementById('js-pjax-loader-bar'), {
    attributes: true,
    attributeFilter: ['class']
  })

  function main() {
    for(var prop in config) {
      if (features[prop]) {
        features[prop]()
      }
    }
  }

  configuration.get(function (items) {
    config = items
    main()
  })

  var get = function (url, callback) {
    var xmlhttp = new XMLHttpRequest()

    xmlhttp.onreadystatechange = function(result) {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        callback(xmlhttp.responseText)
      }
    }

    xmlhttp.open('GET', url, true)
    xmlhttp.send()
  }

  get(chrome.extension.getURL('modal.html'), function(modalHTML) {
    get('https://api.github.com/notifications?access_token=XXX', function(notificationsResponse) {
      var indicator = document.querySelector("#user-links .notification-indicator")
      indicator.classList.remove('tooltipped-s')
      indicator.classList.add('tooltipped-w')

      var div = document.createElement('div')
      div.innerHTML = modalHTML
      document.body.appendChild(div)

      var modal = document.getElementById('__ghcape-modal')
      modal.style.left = (indicator.offsetLeft + indicator.offsetWidth - 300) + "px"

      var notifications = JSON.parse(notificationsResponse)
      var notificationsList = ''

      if (notifications.length > 0) {
        let icons = {
          pull   : modal.querySelector('.octicon-git-pull-request'),
          issues : modal.querySelector('.octicon-issue-opened'),
          commits: modal.querySelector('.octicon-git-commit')
        }

        notificationsList = notifications.map(function(notification) {
          let subject = notification.subject
          let repo    = notification.repository
          let resourceId = subject.url.split('/').slice(-1)

          let type = { Issue: 'issues', PullRequest: 'pull', Commit: 'commits' }[subject.type]

          let url = repo.html_url + '/' + type + '/' + resourceId

          let link = '<a href="' + url + '">' + icons[type].outerHTML + notification.subject.title + '</a>'

          return '<li>' + link + '</li>'
        }).join('\n')
      } else {
        notificationsList = '<li style="text-align:center;">No new notifications</li>'
      }

      document.getElementById('__ghcape-notifications-list').innerHTML = notificationsList

      indicator.addEventListener('click', function(event) {
        indicator.blur()
        modal.classList.toggle('hidden')
        event.preventDefault()
      }, true)
    })
  })



  // -----------------------------------------------------------------------------
  // Features

  var features = {
    showOutdatedComments: function() {
      var outdatedDiffs = document.getElementsByClassName('outdated-diff-comment-container')

      for(var i = 0; i < outdatedDiffs.length; i++) {
        outdatedDiffs[i].classList.add('open')
      }
    },


    showCurrentDiffFileName: function() {
      var prtoolbar = document.querySelector('.pr-toolbar.js-sticky')
      if (! prtoolbar) return

      var diffbar = prtoolbar.querySelector('.diffbar')
      var headers = document.getElementsByClassName('file-header')
      var blobs   = document.getElementsByClassName('blob-wrapper')

      var diffbarItem = document.getElementById('__ghcape-current-file')
      if (! diffbarItem) {
        diffbarItem = createDiffItem()
        diffbar.insertBefore(diffbarItem, diffbar.querySelector('.float-right'))
      }

      document.addEventListener('scroll', onScroll, false)

      onScroll()

      function onScroll() {
        var index = firstIndexInViewport(blobs)
        var currentHeader = headers[index]

        diffbarItem.style.display = prtoolbar.style.position === 'fixed' ? 'block' : 'none'

        if (currentHeader) {
          diffbarItem.innerHTML = currentHeader.dataset.path
        }
      }

      function createDiffItem() {
        var diffbarItem = document.createElement('div')
        diffbarItem.id = '__ghcape-current-file'
        diffbarItem.className = 'diffbar-item'

        diffbarItem.style.width        = "240px"
        diffbarItem.style.marginRight  = "0"
        diffbarItem.style.whiteSpace   = "nowrap"
        diffbarItem.style.textOverflow = "ellipsis"
        diffbarItem.style.overflow     = "hidden"

        return diffbarItem
      }
    },


    collapsableDiffs: function() {
      makeCollapsable({
        trigger: 'file-header',
        toggleableSibling: 'blob-wrapper'
      })
    },


    showHideAllButtons: function() {
      var actions = document.querySelector('.pr-toolbar.js-sticky .float-right')

      if (actions && actions.getElementsByClassName('__ghcape-show-hide-all').length === 0) {
        var headers = Array.prototype.slice.call(document.getElementsByClassName('file-header'))

        var showAll = document.createElement('button')
        showAll.innerHTML = 'Show all'
        showAll.className = 'diffbar-item btn-link muted-link __ghcape-show-hide-all'
        showAll.onclick = function () { changeHadersVisibillity('remove') }

        var hideAll = document.createElement('button')
        hideAll.innerHTML = 'Hide all'
        hideAll.className = 'diffbar-item btn-link muted-link __ghcape-show-hide-all'
        hideAll.onclick = function () { changeHadersVisibillity('add') } // This will potentially break the filename on the sticky header

        actions.appendChild(showAll)
        actions.appendChild(hideAll)
      }

      function changeHadersVisibillity(method) {
        headers.forEach(function (header) {
          var code = nextByClass(header, 'blob-wrapper')
          if (code) code.classList[method]('hidden')
        })
      }
    },

  
    collapsableCommits: function() {
      makeCollapsable({
        trigger: 'commit-group-title',
        toggleableSibling: 'commit-group'
      })
    },


    toggleContributions: function() {
      var actionClasses = [
        { trigger: '.text-diff-added',   code: 'blob-code-addition' },
        { trigger: '.text-diff-deleted', code: 'blob-code-deletion' }
      ]

      actionClasses.forEach(function(classes) {
        var trigger = document.querySelector('.diffbar-item.diffstat > ' + classes.trigger)
        if (! trigger) return

        var tooltipText = { 'Hide': 'Show', 'Show': 'Hide' }

        trigger.style.cursor = 'pointer'
        trigger.classList.add('tooltipped', 'tooltipped-s')
        trigger.setAttribute('aria-label', 'Hide')

        trigger.addEventListener('click', function() {
          var code = document.getElementsByClassName('blob-code ' + classes.code)
          var newTooltipText = tooltipText[trigger.getAttribute('aria-label')]
          trigger.setAttribute('aria-label', 'Loading')

          setTimeout(function () {
            for(var i = 0; i < code.length; i++) {
              code[i].parentNode.classList.toggle('hidden')
            }
            trigger.setAttribute('aria-label', newTooltipText)
          })
        }, true)
      })
    }

  }

  // -----------------------------------------------------------------------------
  // Utils

  function makeCollapsable(classes) {
    var triggers = document.getElementsByClassName(classes.trigger)

    for(var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener('click', togglePanel)
      triggers[i].style.cursor = 'pointer'
    }

    function togglePanel(event) {
      if (! event.target.classList.contains(classes.trigger)) return

      var code = nextByClass(this, classes.toggleableSibling)
      if (code) {
        code.classList.toggle('hidden')
      }
    }
  }

  function prevByClass(node, className) {
    return findSibling(node, 'previous', className)
  }

  function nextByClass(node, className) {
    return findSibling(node, 'next', className)
  }

  function findSibling(node, direction, className) {
    while (node = node[direction + 'Sibling']) {
      if (node.classList && node.classList.contains(className)) {
        return node
      }
    }
  }

  function firstIndexInViewport(els) {
    for(let i = 0; i < els.length; i++) {
      if (inViewport(els[i])) {
        return i
      }
    }
  }

  function inViewport(el) {
    let rect = el.getBoundingClientRect()
    let windowHeight = window.innerHeight || document.documentElement.clientHeight
    return rect.height && rect.top <= windowHeight && (rect.top + rect.height) >= 0
  }
})()

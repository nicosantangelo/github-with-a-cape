/* Globals: configuration, notifications */

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
      if (config[prop] && features[prop]) {
        features[prop]()
      }
    }
  }

  configuration.get(function (items) {
    config = items
    main()
  })

  insertStyles()

  // -----------------------------------------------------------------------------
  // Features

  var features = {
    showOutdatedComments: function() {
      var outdatedDiffs = document.getElementsByClassName('outdated-diff-comment-container')

      for(var i = 0; i < outdatedDiffs.length; i++) {
        outdatedDiffs[i].classList.add('open')
      }
    },


    highlightOutdatedDiffIcons: function() {
      var octicons = document.querySelectorAll('.discussion-timeline .discussion-item-icon .octicon-x')

      for(var i = 0; i < octicons.length; i++) {
        var discussionItemIcon = octicons[i].parentElement
        discussionItemIcon.style.backgroundColor = '#ffefc6'
        discussionItemIcon.style.color = '#4c4a42'
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
        diffbar.insertBefore(diffbarItem, diffbar.querySelector('.diffbar-item.toc-select').nextElementSibling)
      }

      document.addEventListener('scroll', onScroll, false)

      onScroll()

      function onScroll() {
        var index = firstIndexInViewport(blobs)
        var currentHeader = headers[index]

        diffbarItem.style.display = prtoolbar.style.position === 'fixed' ? 'block' : 'none'

        if (currentHeader) {
          diffbarItem.innerHTML = currentHeader.dataset.path
          diffbarItem.title = currentHeader.dataset.path
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
      var actions = document.querySelector('.pr-toolbar.js-sticky .toc-select ~ .float-right') // Ugh

      if (actions && actions.getElementsByClassName('__ghcape-show-hide-all').length === 0) {
        var headers = Array.prototype.slice.call(document.getElementsByClassName('file-header'))

        var showAll = document.createElement('button')
        showAll.innerHTML = 'Show all'
        showAll.className = 'diffbar-item btn-link muted-link __ghcape-show-hide-all'
        showAll.onclick = function() { changeHadersVisibillity('remove') }

        var hideAll = document.createElement('button')
        hideAll.innerHTML = 'Hide all'
        hideAll.className = 'diffbar-item btn-link muted-link __ghcape-show-hide-all'
        hideAll.onclick = function() { changeHadersVisibillity('add') } // This will potentially break the filename on the sticky header

        actions.appendChild(showAll)
        actions.appendChild(hideAll)
      }

      function changeHadersVisibillity(method) {
        headers.forEach(function(header) {
          var code = nextByClass(header, 'blob-wrapper')
          if (code) code.classList[method]('__ghcape-hidden')
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
        { trigger: '.text-green', code: 'blob-code-addition' },
        { trigger: '.text-red', code: 'blob-code-deletion' }
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
              code[i].parentNode.classList.toggle('__ghcape-hidden')
            }
            trigger.setAttribute('aria-label', newTooltipText)
          })
        }, true)
      })
    },

    notifications: function() {
      notifications.load()
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
        code.classList.toggle('__ghcape-hidden')
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
    for(var i = 0; i < els.length; i++) {
      if (inViewport(els[i])) {
        return i
      }
    }
  }

  function inViewport(el) {
    var rect = el.getBoundingClientRect()
    var windowHeight = window.innerHeight || document.documentElement.clientHeight
    return rect.height && rect.top <= windowHeight && (rect.top + rect.height) >= 0
  }

  function insertStyles() {
    var style = document.createElement('style')
    style.innerHTML = '.__ghcape-hidden { display: none !important; }'
    document.body.appendChild(style)
  }
})()

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
        diffbar.insertBefore(diffbarItem, diffbar.querySelector('.diffbar-item.diffstat').nextElementSibling)
      }

      document.addEventListener('scroll', onScroll, false)

      onScroll()

      function onScroll() {
        var index = firstIndexInViewport(blobs)
        var currentHeader = headers[index]

        diffbarItem.style.display = prtoolbar.style.position === 'fixed' ? 'block' : 'none'

        if (currentHeader) {
          diffbarItem.setAttribute('aria-label', currentHeader.dataset.path)
          diffbarItem.firstChild.innerHTML = currentHeader.dataset.path.split('/').slice(-1)
        }
      }

      function createDiffItem() {
        var diffbarItem = document.createElement('div')
        var path = document.createElement('div')

        diffbarItem.id = '__ghcape-current-file'
        diffbarItem.className = 'diffbar-item'
        diffbarItem.classList.add('tooltipped', 'tooltipped-s')

        path.style.marginRight  = '0'
        path.style.whiteSpace   = 'nowrap'
        path.style.textOverflow = 'ellipsis'
        path.style.overflow     = 'hidden'

        if (! inSplitView() && viewingSubsetChanges()) {
          path.style.maxWidth = '65px'
        } else {
          path.style.maxWidth = config.showHideAllButtons ? '160px' : '290px'
        }

        diffbarItem.appendChild(path)

        return diffbarItem
      }
    },


    collapsableDiffs: function() {
      makeCollapsable({
        trigger: 'file-header',
        targets: ['file-header', 'file-info'],
        toggleableSibling: 'js-file-content'
      })
    },


    showHideAllButtons: function() {
      var actions = document.querySelector('.pr-toolbar.js-sticky .toc-select ~ .float-right') // Ugh

      if (actions && actions.getElementsByClassName('__ghcape-show-hide-all').length === 0) {
        var headers = Array.prototype.slice.call(document.getElementsByClassName('file-header'))
        var className = 'btn-link muted-link __ghcape-show-hide-all'

        if(! inSplitView() && viewingSubsetChanges()){
          className += ' __ghcape-hidden'
        }

        var showAll = document.createElement('button')
        showAll.innerHTML = 'Show all'
        showAll.className = className
        showAll.onclick = function() { changeHadersVisibillity('remove') }

        var hideAll = document.createElement('button')
        hideAll.innerHTML = 'Hide all'
        hideAll.className = className
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


    resizeableSplittedDiffs: function() {
      if(! inSplitView()) return

      var datas = Array.prototype.slice.call(document.querySelectorAll('.data:not(.__ghcape-draggable)'))
      var codeWidth = null
      var draggableBarWidth = null

      datas.forEach(function(data) {
        var table = data.firstElementChild

        if (! table) return

        var code = findFirstTd(table)

        if(! draggableBarWidth) {
          var tr = table.querySelector('tr:not(.js-expandable-line)')
          draggableBarWidth = (tr.clientWidth / 2) + 'px'
        }

        if(! codeWidth) {
          codeWidth = getComputedStyle(code, null).getPropertyValue('width')
          codeWidth = parseInt(codeWidth, 10) + 'px'
        }

        var draggableBar = document.createElement('div')
        draggableBar.className = '__ghcape-draggable-bar'
        draggableBar.style.top = 0
        draggableBar.style.left = draggableBarWidth

        code.style.width = codeWidth

        data.classList.add('__ghcape-draggable')
        data.appendChild(draggableBar)

        setTimeout(function() { attachEvents(draggableBar) }, 0)
      })

      function attachEvents(draggableBar) {
        var table    = draggableBar.previousElementSibling
        var maxWidth = 970
        var minWidth = 370
        var offset   = 0
        var mouseX   = 0
        var td       = null

        var move = function(event) {
          td = td || findFirstTd(table)

          var direction = mouseX === 0 ? 1 : (event.pageX - mouseX)
          var width = (parseInt(td.style.width, 10) + direction)

          if (width >= minWidth && width < maxWidth) {
            td.style.width = width + 'px'
            draggableBar.style.left = (event.clientX - offset) + 'px'
            mouseX = event.pageX
          }
        }

        draggableBar.addEventListener('mousedown', function(e) {
          offset = e.clientX - parseInt(draggableBar.style.left, 10)
          table.parentElement.style.userSelect = 'none'
          document.addEventListener('mousemove', move, false)
        }, false)

        document.addEventListener('mouseup', function() {
          table.parentElement.style.userSelect = 'inherit'
          document.removeEventListener('mousemove', move, false)
        }, false)
      }

      function findFirstTd(table) {
        return table.querySelector('.blob-num:not(.blob-num-expandable):not(.blob-num-hunk) ~ td')
      }
    },


    notifications: function() {
      notifications.load()
    }
  }

  // -----------------------------------------------------------------------------
  // Utils

  function makeCollapsable(classes) {
    var triggers = document.getElementsByClassName(classes.trigger)
    var targets  = classes.targets || [ classes.trigger ]

    for(var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener('click', togglePanel)
      triggers[i].style.cursor = 'pointer'
    }

    function togglePanel(event) {
      if (! containsAnyClass(event.target, targets)) return

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

  function containsAnyClass(el, classes) {
    for(var i = 0; i < classes.length; i++) {
      if (el.classList.contains(classes[i])) {
        return true
      }
    }
    return false
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

  function inSplitView() {
    return !! document.querySelector('.BtnGroup [aria-label="Viewing diff in split mode"]')
  }

  function viewingSubsetChanges() {
    return document.getElementsByClassName('subset-files-tab').length
  }

  function insertStyles() {
    var style = document.createElement('style')
    var styles = [
      '.__ghcape-hidden { display: none !important; }',

      '.__ghcape-show-hide-all { margin-left: 8px; line-height: 28px; }',

      '.__ghcape-draggable { position: relative; }',
      '.__ghcape-draggable .diff-table.file-diff-split { table-layout: auto; }',
      '.__ghcape-draggable td.blob-num { width: inherit; min-width: inherit; }',

      '.__ghcape-draggable-bar {',
        'height: 100%; width: 8px;',
        'top: 0; position: absolute;',
        'border-left: 2px solid #d8d8d8; border-right: 2px solid #d8d8d8;',
        'background: #F7F7F7;',
        'cursor: col-resize;',
      '}'
    ]
    style.innerHTML = styles.join(' ')

    document.body.appendChild(style)
  }
})()

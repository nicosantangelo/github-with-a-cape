;(function () {
  'use strict'

  var configuration = {}

  var urlObserver = new window.MutationObserver(function(mutations, observer) {
    setTimeout(main)
  })

  urlObserver.observe(document.getElementById('js-pjax-loader-bar'), {
    attributes: true,
    attributeFilter: ['class']
  })

  function main() {
    if (configuration.SHOW_OUTDATED_COMMENTS) {
      shoutOutdatedDiffs()
    }

    if (configuration.SHOW_CURRENT_FILE_NAME) {
      showCurrentFileName()
    }

    if (configuration.COLLAPSABLE_DIFFS) {
      collapsableDiffs()
    }
  }

  chrome.storage.sync.get({
    SHOW_OUTDATED_COMMENTS: true,
    SHOW_CURRENT_FILE_NAME: true,
    COLLAPSABLE_DIFFS     : true
  }, function (items) {
    configuration = items
    main()
  })

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    // This could be nicer and re-bind all events after each update
    for(var prop in changes) {
      configuration[prop] = changes[prop].newValue
    }
  })

  // -----------------------------------------------------------------------------
  // Features

  function shoutOutdatedDiffs() {
    var outdatedDiffs = document.getElementsByClassName('outdated-diff-comment-container')

    for(var i = 0; i < outdatedDiffs.length; i++) {
      outdatedDiffs[i].classList.add('open')
    }
  }

  
  function collapsableDiffs() {
    var headers = document.getElementsByClassName('file-header')

    // TODO: Collapse ALL button

    for(var i = 0; i < headers.length; i++) {
      headers[i].addEventListener('click', togglePanel)
      headers[i].style.cursor = 'pointer'
    }

    function togglePanel() {
      var code = nextByClass(this, 'blob-wrapper')
      if (code) {
        code.classList.toggle('hidden')
      }
    }
  }


  function showCurrentFileName() {
    var prtoolbar = document.querySelector('.pr-toolbar.js-sticky')
    if (! prtoolbar) return

    var diffbar = prtoolbar.querySelector('.diffbar')
    var headers = document.getElementsByClassName('file-header')
    var blobs   = document.getElementsByClassName('blob-wrapper')

    var diffbarItem = document.getElementById('__github-suite-current-file')
    if (! diffbarItem) {
      diffbarItem = document.createElement('div')
      diffbarItem.id = '__github-suite-current-file'
      diffbarItem.className = 'diffbar-item'
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
  }


  // -----------------------------------------------------------------------------
  // Utils

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

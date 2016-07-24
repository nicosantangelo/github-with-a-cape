;(function () {
  'use strict'

  var urlObserver = new window.MutationObserver(function(mutations, observer) {
    setTimeout(main)
  })

  urlObserver.observe(document.getElementById('js-pjax-loader-bar'), {
    attributes: true,
    attributeFilter: ['class']
  })

  main()

  function main() {
    // -----------------------------------------------------------------------------
    // Show outdated diffs by default

    let outdatedDiffs = document.querySelectorAll('.outdated-diff-comment-container')

    for(let i = 0; i < outdatedDiffs.length; i++) {
      outdatedDiffs[i].classList.add('open')
    }

    
    // -----------------------------------------------------------------------------
    // Collapse diffs

    let headers = document.querySelectorAll('.file-header')
    // TODO: Collapse ALL
    for(let i = 0; i < headers.length; i++) {
      headers[i].addEventListener('click', togglePanel)
      headers[i].style.cursor = 'pointer'
    }

    function togglePanel() {
      let code = nextByClass(this, 'blob-wrapper')
      if (code) {
        code.classList.toggle('hidden')
      }
    }

    // -----------------------------------------------------------------------------
    // Current code file name on sticky bar
    let prtoolbar = document.querySelector('.pr-toolbar.js-sticky')

    // TODO: Add the first file name at start
    if (prtoolbar) {
      let diffbar = prtoolbar.querySelector('.diffbar')
      let blobs = document.querySelectorAll('.blob-wrapper')

      let diffbarItem = document.getElementById('__github-suite-current-file')
      if (! diffbarItem) {
        diffbarItem = document.createElement('div')
        diffbarItem.id = '__github-suite-current-file'
        diffbarItem.className = 'diffbar-item'
        diffbar.insertBefore(diffbarItem, diffbar.querySelector('.float-right'))
      }

      document.addEventListener('scroll', function() {
        let index = firstIndexInViewport(blobs)
        let currentHeader = headers[index]
        
        if (currentHeader) {
          diffbarItem.innerHTML = currentHeader.dataset.path
        }
      })
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

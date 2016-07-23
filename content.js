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

    // Add the first file name at start
    if (prtoolbar) {
      let diffbar = prtoolbar.querySelector('.diffbar')
      let diffbarItem = document.createElement('div')
      let blobs = document.querySelectorAll('.blob-wrapper')

      diffbarItem.className = 'diffbar-item'
      diffbar.insertBefore(diffbarItem, diffbar.firstChild)

      document.addEventListener('scroll', function() {
        let currentBlob = firstInViewport(blobs)

        if (currentBlob) {
          let currentHeader = prevByClass(currentBlob, 'file-header')
          let currentFile = currentHeader.querySelector('.user-select-contain').innerHTML
          diffbarItem.innerHTML = currentFile
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

  function firstInViewport(els) {
    for(let i = 0; i < els.length; i++) {
      if (inViewport(els[i])) {
        return els[i]
      }
    }
  }

  function inViewport(el) {
    let rect = el.getBoundingClientRect()
    let windowHeight = window.innerHeight || document.documentElement.clientHeight
    return rect.top <= windowHeight && (rect.top + rect.height) >= 0
  }

})()

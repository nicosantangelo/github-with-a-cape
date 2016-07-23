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
  }


  // -----------------------------------------------------------------------------
  // Utils

  function nextByClass(node, className) {
    while (node = node.nextSibling) {
      if (node.classList && node.classList.contains(className)) {
        return node
      }
    }
  }

})()

;(function () {
  'use strict'

  // -----------------------------------------------------------------------------
  // Show outdated diffs by default

  let outdatedDiffs = document.querySelectorAll('.outdated-diff-comment-container')
  
  for(let i = 0; i < outdatedDiffs.length; i++) {
    outdatedDiffs[i].classList.add('open')
  }
})()

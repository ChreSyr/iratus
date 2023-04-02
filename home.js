"use strict";

function setStyle(num) {
    var maintheme = document.getElementById('maincss');
    var customtheme = document.getElementById('customcss');
    if (num === 'no') {
        maintheme.setAttribute('href', null)
    } else {
        maintheme.setAttribute('href', 'sharedstyle.css')
    }
    customtheme.setAttribute('href', 'stylesheet' + num + '.css')
}

function enrage() {
    var dogleft = document.getElementById('title-dogleft');
    dogleft.src = "images/logo_enraged_black.png"
    var dogright = document.getElementById('title-dogright');
    dogright.src = "images/logo_enraged_black.png"
}

function quiet() {
    var dogleft = document.getElementById('title-dogleft');
    dogleft.src = "images/logo_quiet_black.png"
    var dogright = document.getElementById('title-dogright');
    dogright.src = "images/logo_quiet_black.png"
}

function ajustSquareSize() {
  var squareSize = Math.min(document.body.clientWidth / 8, (document.body.clientHeight) / 13, 60);
  document.documentElement.style.setProperty('--square-size', squareSize + 'px');
}
window.addEventListener('resize', ajustSquareSize);
ajustSquareSize();
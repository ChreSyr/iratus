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
  var squareSize = Math.floor(Math.min(document.body.clientWidth / 8, (document.body.clientHeight) / 13, 80));
  document.documentElement.style.setProperty('--square-size', squareSize + 'px');
}
window.addEventListener('resize', ajustSquareSize);
ajustSquareSize();

// Creating pieces styles
function setPiecesStyle(style=null) {
  if (style !== null) {throw Error}  // not implemented
  
  var colors = ["b", "w"];
  var pieceIDs = ["b", "d", "dy", "ed", "es", "g", "i", "k", "n", "p", "q", "r", "s"];

  let css = '';

  for (let color of colors) {
    for (let pieceID of pieceIDs) {
      css += `\
      #board-single .piece.${color}${pieceID}, #board-single .promotion-piece.${color}${pieceID} {
        background-image: url(images/${color}${pieceID}.png);
      }
      #board-single .dynamited.${color}${pieceID} {
        background-image: url(images/${color}${pieceID}.png), url(images/${color}dy.png);
      }
`
    }
  }

  var piecesStyle = document.getElementById("board-styles-single");

  if (piecesStyle.styleSheet){
    // This is required for IE8 and below.
    piecesStyle.styleSheet.cssText = css;
  } else {
    piecesStyle.appendChild(document.createTextNode(css));
  }
}
setPiecesStyle();
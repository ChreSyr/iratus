
// Change the property squareSize depending on screen size
function ajustSquareSize() {
  
  return document.documentElement.style.setProperty('--square-size', 60 + 'px');
  // var screenWidth = screen.width;
  // var screenHeight = screen.height;

  // console.log("Screen Width: " + screenWidth);
  // console.log("Screen Height: " + screenHeight);

  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;

  console.log("Window Width: " + windowWidth);
  console.log("Window Height: " + windowHeight);

  // var clientWidth = document.body.clientWidth;
  // var clientHeight = document.body.clientHeight;

  // console.log("Document Width: " + clientWidth);
  // console.log("Document Height: " + clientHeight);

  var rootFontSize = window.getComputedStyle(document.documentElement).fontSize;
  var fontSizeValue = parseFloat(rootFontSize);
  console.log("Root Font Size Value: " + fontSizeValue);

  // availible space for the baord and the players info
  var availibleWidth = window.innerWidth - fontSizeValue * 2
  var availibleHeight = window.innerHeight - fontSizeValue * ( 1 + 4 + 1 + 1 + 4 + 1 + 5 )

  console.log("Availible Width: " + availibleWidth);
  console.log("Availible Height: " + availibleHeight);

  var squareSize = Math.floor(Math.min(availibleWidth / 8, availibleHeight / 10));

  console.log("Square Size: " + squareSize);

  document.documentElement.style.setProperty('--square-size', squareSize + 'px');
}

// Hide the promotion window and 
const cancelPromotion = (event) => {
  if (game.board.pawnToPromote) {
    const color = game.board.pawnToPromote.color;
    game.undo();
    game.board.pawnToPromote = null;
  
    let promotionWindow = document.getElementsByClassName("promotion-window")[0];
    promotionWindow.style.display = "none";
    
    let promotionPieces = document.getElementsByClassName("promotion-piece");
    for (let promotionPiece of promotionPieces) {
      promotionPiece.classList.remove(color + promotionPiece.classList[1]);
    }
  }
}

// Close settings
function closeSettings() {
  document.getElementById("overlay").style.display = "none";
  document.getElementsByClassName("settings")[0].style.display = "none";
}

// Returns whether or not an event collides with a screen element
function collide(event, element) {
  let rect = element.getBoundingClientRect();
  let x = event.clientX - rect.x;
  let y = event.clientY - rect.y;
  return x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
}

// Handle when an option is selected in the style <select>
function handleStyleSelection() {
  var selectedOption = document.getElementById("styleSelector").value;
  document.getElementById('customcss').setAttribute('href', 'css/custom/stylesheet' + selectedOption + '.css');
}

// Hide the info window shown after a game
function hideInfo() {
  document.getElementById("info").style.display = "none";
}

// Return true if the user is using a mobile
function isMobileDevice() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

// Add pointerdown listener on squares (like accessible, selected...)
function makeSquareClickable(square) {
      
  const pointerdownHandle = (event) => {

    cancelPromotion();

    if (square.classList.contains("accessible")) {
      let selectedPiece = game.board.selectedPiece;
      selectedPiece.unselect();
      try{
        game.move(start=[selectedPiece.row, selectedPiece.col], end=[parseInt(square.dataset.row), parseInt(square.dataset.col)]);
      } catch (error) {
        console.log(error)
      }
    } else {
      if (game.board.selectedPiece) {
        game.board.selectedPiece.unselect();
      }
    }
  }
  
  if (isMobileDevice()) {
    // User is on a mobile device
    square.addEventListener('touchstart', pointerdownHandle);
    // element.addEventListener('touchstart', event => {console.log("touchstart")});
  } else {
    // User is on a desktop device
    square.addEventListener('mousedown', pointerdownHandle);
    // element.addEventListener('mousedown', event => {console.log("mousedown")});
  }
  // square.addEventListener('pointerdown', pointerdownHandle);
}

// Add event listeners on pieces for movements
function makePieceDraggableRECENT(element) {
  let pos = {x: 0, y: 0};
  let dragging = false;
  let wasSelected = false;
  
  const stopScrollEvents = (event) => {
    event.preventDefault();
  }
      
  const pointerdownHandle = (event) => {

    cancelPromotion();

    const squareAccessible = document.querySelector(`.square[data-row="${element.piece.row}"][data-col="${element.piece.col}"]`);
    if (squareAccessible) {return} 

    let rect = element.getBoundingClientRect();
    dragging = {dx: - rect.x - rect.width / 2, dy: - rect.y - rect.height / 2};
    pos.x = event.clientX + dragging.dx;
    pos.y = event.clientY + dragging.dy;

    var squareSize = parseInt(document.documentElement.style.getPropertyValue("--square-size"), 10);
    element.style.transform = `translate(${(element.piece.col + pos.x / squareSize) * 100}%, ${(element.piece.row + pos.y / squareSize) * 100}%)`;
    element.classList.add('dragging');
    element.setPointerCapture(event.pointerId);

    wasSelected = element.piece === game.board.selectedPiece;
    element.piece.handlePointerDown();

  }
  
  const pointerupHandle = (event) => {
    dragging = null;
    element.classList.remove('dragging');
    element.style.transform = "";

    // if clicked for move destination
    let squares = document.querySelectorAll(".square");
    for (let square of squares) {
      if (collide(event, square)) {
        if (square.classList.contains("accessible")) {
          let selectedPiece = game.board.selectedPiece;
          selectedPiece.unselect();
          game.move(start=[selectedPiece.row, selectedPiece.col], end=[parseInt(square.dataset.row), parseInt(square.dataset.col)])
        }
        break;
      }
    }
    if (element.piece && wasSelected) {
      element.piece.unselect();
    }  // else, the piece has moved
  }
  
  const pointermoveHandle = (event) => {
    if (!dragging) {return};
    pos.x = event.clientX + dragging.dx;
    pos.y = event.clientY + dragging.dy;
    var squareSize = parseInt(document.documentElement.style.getPropertyValue("--square-size"), 10);
    element.style.transform = `translate(${(element.piece.col + pos.x / squareSize) * 100}%, ${(element.piece.row + pos.y / squareSize) * 100}%)`;
    // element.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
  }
  
  element.addEventListener('pointerdown', pointerdownHandle);
  element.addEventListener('pointerup', pointerupHandle);
  element.addEventListener('pointercancel', pointerupHandle);
  element.addEventListener('pointermove', pointermoveHandle);
  element.addEventListener('touchstart', stopScrollEvents);
}

// Add event listeners on pieces for movements
function makePieceDraggable(element) {
  let pos = {x: 0, y: 0};
  let dragging = false;
  let wasSelected = false;
  
  const stopScrollEvents = (event) => {
    event.preventDefault();
  }
      
  const pointerdownHandle = (event) => {
    
    // try {

      cancelPromotion();

      const squareAccessible = document.querySelector(`.square[data-row="${element.piece.row}"][data-col="${element.piece.col}"]`);
      if (squareAccessible) {
        if (isMobileDevice()) {
          // instant move
          let selectedPiece = game.board.selectedPiece;
          selectedPiece.unselect();
          game.move(start=[selectedPiece.row, selectedPiece.col], end=[parseInt(element.piece.row), parseInt(element.piece.col)])
        }
        return;
      } 

      let rect = element.getBoundingClientRect();
      dragging = {dx: - rect.x - rect.width / 2, dy: - rect.y - rect.height / 2};
      pos.x = event.clientX + dragging.dx;
      pos.y = event.clientY + dragging.dy;

      var squareSize = parseInt(document.documentElement.style.getPropertyValue("--square-size"), 10);
      element.style.transform = `translate(${(element.piece.col + pos.x / squareSize) * 100}%, ${(element.piece.row + pos.y / squareSize) * 100}%)`;
      element.classList.add('dragging');
      // element.setPointerCapture(event.pointerId);

      wasSelected = element.piece === game.board.selectedPiece;
      element.piece.handlePointerDown();
    
    // } catch (error) {
    //   console.log(error);
    // }

  }
  
  const pointerupHandle = (event) => {
    dragging = null;
    element.classList.remove('dragging');
    element.style.transform = "";

    // if clicked for move destination
    let squares = document.querySelectorAll(".square");
    for (let square of squares) {
      if (collide(event, square)) {
        if (square.classList.contains("accessible")) {
          let selectedPiece = game.board.selectedPiece;
          selectedPiece.unselect();
          game.move(start=[selectedPiece.row, selectedPiece.col], end=[parseInt(square.dataset.row), parseInt(square.dataset.col)])
        }
        break;
      }
    }
    if (element.piece && wasSelected) {
      element.piece.unselect();
    }  // else, the piece has moved
  }
  
  const pointermoveHandle = (event) => {
    if (!dragging) {return};
    pos.x = event.clientX + dragging.dx;
    pos.y = event.clientY + dragging.dy;
    var squareSize = parseInt(document.documentElement.style.getPropertyValue("--square-size"), 10);
    element.style.transform = `translate(${(element.piece.col + pos.x / squareSize) * 100}%, ${(element.piece.row + pos.y / squareSize) * 100}%)`;
  }
  
  // element.addEventListener('pointerdown', pointerdownHandle);
  // pointerdown is the newer version of mousedown & touchstart
  // element.addEventListener('mousedown', pointerdownHandle);
  // element.addEventListener('mousedown', event => {console.log("mousedown")});
  
  if (isMobileDevice()) {
    // User is on a mobile device
    element.addEventListener('touchstart', pointerdownHandle);
    // element.addEventListener('touchstart', event => {console.log("touchstart")});
  } else {
    // User is on a desktop device
    element.addEventListener('mousedown', pointerdownHandle);
    // element.addEventListener('mousedown', event => {console.log("mousedown")});
  }
  element.addEventListener('touchstart', pointerdownHandle);
  element.addEventListener('pointerup', pointerupHandle);
  element.addEventListener('pointercancel', pointerupHandle);
  element.addEventListener('pointermove', pointermoveHandle);
  element.addEventListener('touchstart', stopScrollEvents);
}

// Open settings
function openSettings() {
  document.getElementById("overlay").style.display = "flex";
  document.getElementsByClassName("settings")[0].style.display = "flex";
}

// Writes css code in <script id="board-styles-single">
// This code defines the images of the pieces
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

// change the reference of the custom stylesheet 
function setStyle(num) {
  document.getElementById('customcss').setAttribute('href', 'css/custom/stylesheet' + num + '.css');
}

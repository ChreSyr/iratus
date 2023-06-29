// Change the property squareSize depending on screen size
function ajustSquareSize() {
  // var screenWidth = screen.width;
  // var screenHeight = screen.height;

  // console.log("Screen Width: " + screenWidth);
  // console.log("Screen Height: " + screenHeight);

  // var windowWidth = window.innerWidth;
  // var windowHeight = window.innerHeight;

  // console.log("Window Width: " + windowWidth);
  // console.log("Window Height: " + windowHeight);

  // var clientWidth = document.body.clientWidth;
  // var clientHeight = document.body.clientHeight;

  // console.log("Document Width: " + clientWidth);
  // console.log("Document Height: " + clientHeight);

  var clientWidth = document.firstElementChild.clientWidth;
  var clientHeight = document.firstElementChild.clientHeight;

  // console.log("HTML Width: " + clientWidth);
  // console.log("HTML Height: " + clientHeight);

  var rootFontSize = window.getComputedStyle(document.documentElement).fontSize;
  var fontSizeValue = parseFloat(rootFontSize);
  // console.log("Root Font Size Value: " + fontSizeValue);

  // availible space for the baord and the players info
  var availibleWidth = clientWidth - fontSizeValue * 2;
  if (clientWidth < 1024) {
    var availibleHeight =
      clientHeight - fontSizeValue * (1 + 4 + 1 + 1 + 4 + 1 + 6 + 1);
  } else {
    var availibleHeight =
      clientHeight - fontSizeValue * (1 + 4 + 1 + 1 + 4 + 1);
  }

  // console.log("Availible Width: " + availibleWidth);
  // console.log("Availible Height: " + availibleHeight);

  if (isMobileDevice()) {
    var squareSize = Math.floor(availibleWidth / 8);
  } else {
    var squareSize = Math.floor(
      Math.min(availibleWidth / 8, availibleHeight / 10)
    );
  }

  // we switch to desktop view at MAX * 8 + body.padding * 2 + header.width = 68 * 8 + 10 * 2 + 50 = 614px
  squareSize = Math.min(squareSize, 68); // No more than 68

  // console.log("Square Size: " + squareSize);

  document.documentElement.style.setProperty(
    "--square-size",
    squareSize + "px"
  );
}

// Hide the promotion window and
const cancelPromotion = (event) => {
  if (game.board.pawnToPromote) {
    const color = game.board.pawnToPromote.color;
    game.undo();
    game.board.pawnToPromote = null;

    let promotionWindow =
      document.getElementsByClassName("promotion-window")[0];
    promotionWindow.style.display = "none";

    let promotionPieces = document.getElementsByClassName("promotion-piece");
    for (let promotionPiece of promotionPieces) {
      promotionPiece.classList.remove(color + promotionPiece.classList[1]);
    }
  }
};

// Returns whether or not an event collides with a screen element
function collide(event, element) {
  let rect = element.getBoundingClientRect();
  let x = event.clientX - rect.x;
  let y = event.clientY - rect.y;
  return x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
}

// Handle when an option is selected in the style <select>
function handleRotationSelect() {
  var rotationSelect = document.getElementById("select-rotation");
  var gameWrapper = document.getElementById("game-wrapper");
  for (let option of rotationSelect.options) {
    gameWrapper.classList.remove("rotation-" + option.value);
  }
  if (rotationSelect.value !== "no") {
    gameWrapper.classList.add("rotation-" + rotationSelect.value);
  }
}

// Hide the info window shown after a game
function hideInfo() {
  document.getElementById("info").style.display = "none";
}

// Return true if the user is using a mobile
function isMobileDevice() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

// Add event listener on squares (like accessible, selected...)
function makeSquareClickable(square) {
  const pointerdownHandle = (event) => {
    closeMenu();
    cancelPromotion();

    if (square.classList.contains("accessible")) {
      let selectedPiece = game.board.selectedPiece;
      selectedPiece.unselect();
      try {
        game.move(
          (start = [selectedPiece.row, selectedPiece.col]),
          (end = [parseInt(square.dataset.row), parseInt(square.dataset.col)])
        );
      } catch (error) {
        console.log(error);
      }
    } else {
      if (game.board.selectedPiece) {
        game.board.selectedPiece.unselect();
      }
    }
  };

  const supportsPointerEvents = window.PointerEvent !== undefined;
  square.addEventListener(
    supportsPointerEvents ? "pointerdown" : "mousedown",
    pointerdownHandle
  );

  // if (isMobileDevice()) {
  //   // User is on a mobile device
  //   square.addEventListener("touchstart", pointerdownHandle);
  // } else {
  //   // User is on a desktop device
  //   square.addEventListener("mousedown", pointerdownHandle);
  // }
}

// Add event listeners on pieces for movements
function makePieceDraggable(element) {
  let pos = { x: 0, y: 0 };
  let dragging = false;
  let wasSelected = false;

  // const stopScrollEvents = (event) => {
  //   event.preventDefault();
  // };
  const supportsPointerEvents = window.PointerEvent !== undefined;

  const pointerdownHandle = (event) => {
    event.preventDefault();

    if (event.clientX === undefined) {
      // TouchEvent has no clientX and no clientY
      event.clientX = event.changedTouches[0].clientX;
      event.clientY = event.changedTouches[0].clientY;
    }

    closeMenu();
    cancelPromotion();

    const squareAccessible = document.querySelector(
      `.square[data-row="${element.piece.row}"][data-col="${element.piece.col}"]`
    );
    if (squareAccessible) {
      // instant move
      let selectedPiece = game.board.selectedPiece;
      selectedPiece.unselect();
      game.move(
        (start = [selectedPiece.row, selectedPiece.col]),
        (end = [parseInt(element.piece.row), parseInt(element.piece.col)])
      );
      return;
    }

    let rect = element.getBoundingClientRect();
    dragging = { dx: -rect.x - rect.width / 2, dy: -rect.y - rect.height / 2 };
    pos.x = event.clientX + dragging.dx;
    pos.y = event.clientY + dragging.dy;

    var squareSize = parseInt(
      document.documentElement.style.getPropertyValue("--square-size"),
      10
    );
    const board = element.piece.board;
    if (board.game.isFlipped()) {
      element.style.transform = `translate(${
        (board.nbfiles - 1 - element.piece.col + pos.x / squareSize) * 100
      }%, ${
        (board.nbfiles + 1 - element.piece.row + pos.y / squareSize) * 100
      }%)`;
    } else {
      element.style.transform = `translate(${
        (element.piece.col + pos.x / squareSize) * 100
      }%, ${(element.piece.row + pos.y / squareSize) * 100}%)`;
    }
    if (board.game.hasFlippedPieces()) {
      element.style.transform += " rotate(180deg)";
    }
    element.classList.add("dragging");
    // element.setPointerCapture(event.pointerId);

    wasSelected = element.piece === game.board.selectedPiece;
    element.piece.handlePointerDown();

    if (supportsPointerEvents) {
      document.addEventListener("pointermove", pointermoveHandle);
      document.addEventListener("pointerup", pointerupHandle);
      document.addEventListener("pointercancel", pointerupHandle);
    } else {
      document.addEventListener("mousemove", pointermoveHandle);
      document.addEventListener("mouseup", pointerupHandle);
      document.addEventListener("mouseleave", pointerupHandle);
    }
  };

  const pointerupHandle = (event) => {
    dragging = null;
    element.classList.remove("dragging");
    element.style.transform = "";

    // if clicked for move destination
    let squares = document.querySelectorAll(".square");
    for (let square of squares) {
      if (collide(event, square)) {
        if (square.classList.contains("accessible")) {
          let selectedPiece = game.board.selectedPiece;
          selectedPiece.unselect();
          game.move(
            (start = [selectedPiece.row, selectedPiece.col]),
            (end = [parseInt(square.dataset.row), parseInt(square.dataset.col)])
          );
        }
        break;
      }
    }
    if (element.piece && wasSelected) {
      element.piece.unselect();
    } // else, the piece has moved

    if (supportsPointerEvents) {
      document.removeEventListener("pointermove", pointermoveHandle);
      document.removeEventListener("pointerup", pointerupHandle);
      document.removeEventListener("pointercancel", pointerupHandle);
    } else {
      document.removeEventListener("mousemove", pointermoveHandle);
      document.removeEventListener("mouseup", pointerupHandle);
      document.removeEventListener("mouseleave", pointerupHandle);
    }

    // if (isMobileDevice()) {
    //   // User is on a mobile device
    //   document.removeEventListener("touchmove", pointermoveHandle);
    //   document.removeEventListener("touchend", pointerupHandle);
    //   document.removeEventListener("touchcancel", pointerupHandle);
    // } else {
    //   // User is on a desktop device
    //   document.removeEventListener("mousemove", pointermoveHandle);
    //   document.removeEventListener("mouseup", pointerupHandle);
    // }
  };

  const pointermoveHandle = (event) => {
    if (!dragging) {
      return;
    }
    pos.x = event.clientX + dragging.dx;
    pos.y = event.clientY + dragging.dy;
    var squareSize = parseInt(
      document.documentElement.style.getPropertyValue("--square-size"),
      10
    );
    const board = element.piece.board;
    if (board.game.isFlipped()) {
      element.style.transform = `translate(${
        (board.nbfiles - 1 - element.piece.col + pos.x / squareSize) * 100
      }%, ${
        (board.nbfiles + 1 - element.piece.row + pos.y / squareSize) * 100
      }%)`;
    } else {
      element.style.transform = `translate(${
        (element.piece.col + pos.x / squareSize) * 100
      }%, ${(element.piece.row + pos.y / squareSize) * 100}%)`;
    }
    if (board.game.hasFlippedPieces()) {
      element.style.transform += " rotate(180deg)";
    }
  };

  // element.addEventListener('pointerdown', pointerdownHandle);
  // pointerdown is the newer version of mousedown & touchstart
  // element.addEventListener('mousedown', pointerdownHandle);

  element.addEventListener(
    supportsPointerEvents ? "pointerdown" : "mousedown",
    pointerdownHandle
  );
  // if (isMobileDevice()) {
  //   // User is on a mobile device
  //   element.addEventListener("touchstart", pointerdownHandle);
  //   // element.addEventListener("touchmove", pointermoveHandle);
  //   // element.addEventListener("touchend", pointerupHandle);
  //   // element.addEventListener("touchcancel", pointerupHandle);
  // } else {
  //   // User is on a desktop device
  //   element.addEventListener("mousedown", pointerdownHandle);
  //   // element.addEventListener("mousemove", pointermoveHandle);
  //   // element.addEventListener("mouseup", pointerupHandle);
  // }
  // element.addEventListener("touchstart", pointerdownHandle);
  // element.addEventListener("pointerup", pointerupHandle);
  // element.addEventListener("pointercancel", pointerupHandle);
  // element.addEventListener("pointermove", pointermoveHandle);
  // element.addEventListener("touchstart", stopScrollEvents);
}

// Writes css code in <script id="board-styles-single">
// This code defines the images of the pieces
function setPiecesStyle(style = null) {
  if (style !== null) {
    throw Error;
  } // not implemented

  var colors = ["b", "w"];
  var pieceIDs = [
    "b",
    "d",
    "dy",
    "ed",
    "es",
    "g",
    "i",
    "k",
    "n",
    "p",
    "q",
    "r",
    "s",
  ];

  let css = "";

  for (let color of colors) {
    for (let pieceID of pieceIDs) {
      css += `\
     #board-single .piece.${color}${pieceID}, #board-single .promotion-piece.${color}${pieceID} {
       background-image: url(images/${color}${pieceID}.png);
     }
     #board-single .dynamited.${color}${pieceID} {
       background-image: url(images/${color}${pieceID}.png), url(images/${color}dy.png);
     }
`;
    }
  }

  var piecesStyle = document.getElementById("board-styles-single");

  if (piecesStyle.styleSheet) {
    // This is required for IE8 and below.
    piecesStyle.styleSheet.cssText = css;
  } else {
    piecesStyle.appendChild(document.createTextNode(css));
  }
}

// change the reference of the custom stylesheet
function setStyle(num) {
  document
    .getElementById("customcss")
    .setAttribute("href", "css/custom/stylesheet" + num + ".css");
}

// Hide the promotion window and
const cancelPromotion = (event) => {
  if (game.board.pawnToPromote) {
    const color = game.board.pawnToPromote.color;
    game.undo();
    game.board.pawnToPromote = null;

    let promotionWrapper = document.querySelector(".promotion-wrapper");
    promotionWrapper.style.display = "none";

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

// Add event listener on squares (like accessible, selected...)
function makeSquareClickable(square) {
  const pointerdownHandle = (event) => {
    event.stopPropagation();

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

  square.addEventListener(pointerdown, pointerdownHandle);
}

// Add event listeners on pieces for movements
function makePieceDraggable(element) {
  let pos = { x: 0, y: 0 };
  let dragging = false;
  let wasSelected = false;

  const pointerdownHandle = (event) => {
    event.stopPropagation();

    if (event.clientX === undefined) {
      // TouchEvent has no clientX and no clientY
      event.clientX = event.changedTouches[0].clientX;
      event.clientY = event.changedTouches[0].clientY;
    }

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

    var squareSize = document.getElementById("board-single").clientHeight / 10;

    const board = element.piece.board;
    if (board.game.isFlipped()) {
      element.style.transform = `translate(${
        (board.nbfiles - 1 - element.piece.col + pos.x / squareSize) * 100
      }%, ${(board.nbfiles + 1 - element.piece.row + pos.y / squareSize) * 100}%)`;
    } else {
      element.style.transform = `translate(${(element.piece.col + pos.x / squareSize) * 100}%, ${
        (element.piece.row + pos.y / squareSize) * 100
      }%)`;
    }
    if (board.game.hasFlippedPieces()) {
      element.style.transform += " rotate(180deg)";
    }
    element.classList.add("dragging");
    // element.setPointerCapture(event.pointerId);

    wasSelected = element.piece === game.board.selectedPiece;
    element.piece.handlePointerDown();

    document.addEventListener(pointermove, pointermoveHandle);
    document.addEventListener(pointerup, pointerupHandle);
    document.addEventListener(pointercancel, pointerupHandle);
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

    document.removeEventListener(pointermove, pointermoveHandle);
    document.removeEventListener(pointerup, pointerupHandle);
    document.removeEventListener(pointercancel, pointerupHandle);
  };

  const pointermoveHandle = (event) => {
    if (!dragging) {
      return;
    }
    pos.x = event.clientX + dragging.dx;
    pos.y = event.clientY + dragging.dy;

    var squareSize = document.getElementById("board-single").clientHeight / 10;

    const board = element.piece.board;
    if (board.game.isFlipped()) {
      element.style.transform = `translate(${
        (board.nbfiles - 1 - element.piece.col + pos.x / squareSize) * 100
      }%, ${(board.nbfiles + 1 - element.piece.row + pos.y / squareSize) * 100}%)`;
    } else {
      element.style.transform = `translate(${(element.piece.col + pos.x / squareSize) * 100}%, ${
        (element.piece.row + pos.y / squareSize) * 100
      }%)`;
    }
    if (board.game.hasFlippedPieces()) {
      element.style.transform += " rotate(180deg)";
    }
  };

  element.addEventListener(pointerdown, pointerdownHandle);
}

// Writes css code in <script id="board-styles-single">
// This code defines the images of the pieces
function setPiecesStyle(style = null) {
  if (style !== null) {
    throw Error;
  } // not implemented

  var colors = ["b", "w"];
  var pieceIDs = ["b", "d", "dy", "ed", "es", "g", "i", "k", "n", "p", "q", "r", "s"];

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
  document.getElementById("customcss").setAttribute("href", "css/custom/stylesheet" + num + ".css");
}

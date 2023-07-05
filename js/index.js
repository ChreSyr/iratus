// ERRORS & CONSOLE IN-WEB LOG
// window.onerror = function(message, source, lineno, colno, error) {
//   // Get the error details
//   var errorDetails = {
//     message: message,
//     source: source,
//     lineNumber: lineno,
//     columnNumber: colno,
//     error: error
//   };

//   // Append the error information to the error container
//   appendErrorToContainer(errorDetails);

//   // Prevent the default error handling
//   return true;
// };

// function appendErrorToContainer(errorDetails) {
//   var errorContainer = document.getElementById('errorContainer');
//   var errorMessage = document.createElement('p');
//   errorMessage.textContent = errorDetails.message;
//   errorContainer.appendChild(errorMessage);
// }

// (function() {
//   // Save the reference to the original console.log function
//   var originalLog = console.log;

//   // Override console.log to capture and display the logs
//   console.log = function() {
//     // Get the log arguments and convert them to a string
//     var logMessage = Array.from(arguments).map(function(arg) {
//       return typeof arg === 'object' ? JSON.stringify(arg) : arg;
//     }).join(' ');

//     // Append the log message to the log container
//     appendLogToContainer(logMessage);

//     // Call the original console.log function
//     originalLog.apply(console, arguments);
//   };

//   function appendLogToContainer(logMessage) {
//     var logContainer = document.getElementById('logContainer');
//     var logEntry = document.createElement('p');
//     logEntry.textContent = logMessage;
//     logContainer.appendChild(logEntry);
//   }
// })();

setPiecesStyle();

var game;

game = new Game(IratusBoard);

// ATTACHING EVENT LISTENERS

/* handle focus out of board */
const boardDiv = document.getElementById("board-single");

boardDiv.addEventListener(pointerdown, (event) => {
  if (game.board.selectedPiece) {
    game.board.selectedPiece.unselect();
  }
});

boardDiv.addEventListener("focusout", (event) => {
  if (game.board.selectedPiece) {
    game.board.selectedPiece.unselect();
  }
  cancelPromotion();
});

/* PROMOTION */

for (let promotionPiece of document.getElementsByClassName("promotion-piece")) {
  promotionPiece.addEventListener(pointerdown, (event) => {
    const color = game.board.pawnToPromote.color;
    lastMove = game.movesHistory.slice(-1)[0];
    lastMove.executeCommand(
      new Transform(
        game.board.pawnToPromote,
        Pawn.prototype,
        pieceClassesByID[promotionPiece.classList[1]].prototype
      )
    );
    lastMove.notation += "=" + promotionPiece.classList[1].toUpperCase();
    game.board.pawnToPromote = null;
    game.board.updateAllValidMoves();
    game.checkForEnd();

    let promotionWindow = document.getElementsByClassName("promotion-window")[0];
    promotionWindow.style.display = "none";

    let promotionPieces = document.getElementsByClassName("promotion-piece");
    for (let promotionPiece of promotionPieces) {
      promotionPiece.classList.remove(color + promotionPiece.classList[1]);
    }
  });
}

document
  .getElementsByClassName("promotion-cancel")[0]
  .addEventListener(pointerdown, cancelPromotion);

/* GAME TOOLS */

const gameTools = document.querySelector(".game-tools");

function adjustGameTools() {
  if (document.body.clientWidth - boardDiv.offsetWidth >= 410) {
    gameTools.style.width = `${400}px`;
    gameTools.classList.add("at-right");
  } else {
    gameTools.style.width = "100%";
    gameTools.classList.remove("at-right");
  }
}

adjustGameTools();
window.addEventListener("resize", adjustGameTools);

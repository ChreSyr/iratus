// var scripts = document.getElementsByTagName('script');
// var str = Array.from(document.getElementsByTagName('script'), function(script) {
//   var filename = script.src.substring(script.src.lastIndexOf('/')+1);
//   return filename.substring(0, filename.length - 3);
// }).toString();
// alert("loading: " + str);

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

var game;

game = new Game(IratusBoard);

setPiecesStyle();

// ATTACHING EVENT LISTENERS

// document.addEventListener("pointerdown", event => {

//   const boardDiv = document.getElementById("board-single");
//   if (boardDiv.contains(event.target) && boardDiv !== event.target) {return}

//   cancelPromotion();
//   let selectedPiece = game.board.selectedPiece;
//   if (selectedPiece) {
//     selectedPiece.unselect()
//   }
// });

function handlePointerDown(event) {
  const boardDiv = document.getElementById("board-single");
  if (boardDiv.contains(event.target) && boardDiv !== event.target) {
    closeMenu();
    return;
  }

  cancelPromotion();
  let selectedPiece = game.board.selectedPiece;
  if (selectedPiece) {
    selectedPiece.unselect();
  }

  if (
    document.getElementsByClassName("menu-wrapper")[0].contains(event.target)
  ) {
    return;
  }

  closeMenu();
}

const supportsPointerEvents = window.PointerEvent !== undefined;

document.addEventListener(
  supportsPointerEvents ? "pointerdown" : "mousedown",
  handlePointerDown
);

// if (isMobileDevice()) {
//   // User is on a mobile device
//   document.addEventListener("touchstart", handlePointerDown);
//   // document.addEventListener('touchstart', event => {console.log("touchstart")});
// } else {
//   // User is on a desktop device
//   document.addEventListener("mousedown", handlePointerDown);
//   // document.addEventListener('mousedown', event => {console.log("mousedown")});
// }
// document.addEventListener("pointerdown", handlePointerDown);

for (let promotionPiece of document.getElementsByClassName("promotion-piece")) {
  promotionPiece.addEventListener(
    supportsPointerEvents ? "pointerdown" : "mousedown",
    (event) => {
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

      let promotionWindow =
        document.getElementsByClassName("promotion-window")[0];
      promotionWindow.style.display = "none";

      let promotionPieces = document.getElementsByClassName("promotion-piece");
      for (let promotionPiece of promotionPieces) {
        promotionPiece.classList.remove(color + promotionPiece.classList[1]);
      }
    }
  );
}

document
  .getElementsByClassName("promotion-cancel")[0]
  .addEventListener(
    supportsPointerEvents ? "pointerdown" : "mousedown",
    cancelPromotion
  );

ajustSquareSize();

// ATTACHING EVENT LISTENERS

window.addEventListener("resize", ajustSquareSize);

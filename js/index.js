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
});

/* PROMOTION */

const promotionWrapper = document.querySelector(".promotion-wrapper");
promotionWrapper.addEventListener(pointerdown, (event) => {
  event.stopPropagation();
  cancelPromotion();
});

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

    promotionWrapper.style.display = "none";

    let promotionPieces = document.getElementsByClassName("promotion-piece");
    for (let promotionPiece of promotionPieces) {
      promotionPiece.classList.remove(color + promotionPiece.classList[1]);
    }
  });
}

/* GAME TOOLS */

// Dynamic layout of tools-wrapper
const toolsWrapper = document.querySelector(".tools-wrapper");
function adjustToolsWrapper() {
  if (document.body.clientWidth - boardDiv.offsetWidth >= 430) {
    toolsWrapper.style.width = `${400}px`;
    toolsWrapper.classList.add("at-right");
  } else {
    toolsWrapper.style.width = "100%";
    toolsWrapper.classList.remove("at-right");
  }
}
adjustToolsWrapper();
window.addEventListener("resize", adjustToolsWrapper);

// FEN Input
const fenInput = document.getElementById("fen-input");
fenInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.keyCode === 13) {
    fenInput.blur(); // Release the focus from the input
  }
});

// PGN Input
const pgnInput = document.getElementById("pgn-input");
pgnInput.value = game.pgn;

// Automatically ajust heights
fenInput.style.height = fenInput.scrollHeight + "px";
pgnInput.style.height = pgnInput.scrollHeight + 2 + "px";

// Enabling import button
fenInput.addEventListener("input", (event) => {
  // fenInput.nextElementSibling = import button
  fenInput.nextElementSibling.disabled = fenInput.value === game.board.fen;
});
pgnInput.addEventListener("input", (event) => {
  pgnInput.style.height = "0px";
  pgnInput.style.height = pgnInput.scrollHeight + 2 + "px";

  // pgnInput.nextElementSibling = import button
  pgnInput.nextElementSibling.disabled = pgnInput.value === game.pgn;
});

// Import / Export buttons
for (let input of [fenInput, pgnInput]) {
  const importBtn = input.nextElementSibling;
  const exportBtn = importBtn.nextElementSibling;
  exportBtn.addEventListener("click", (event) => {
    navigator.clipboard
      .writeText(input.value)
      .then(() => {
        // console.log("Text copied to clipboard:", input.value);
        const originalTextContent = exportBtn.textContent;
        exportBtn.textContent = "Copié";
        setTimeout(() => {
          exportBtn.textContent = originalTextContent;
        }, 2000);
      })
      .catch((error) => {
        console.error("Failed to copy text:", input.value);
      });
  });
}

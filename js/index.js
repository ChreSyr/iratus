setPiecesStyle();

var game;

game = new Game(IratusBoard);

// ATTACHING EVENT LISTENERS

/* handle focus out of board */
const boardDiv = document.getElementById("board-single");

boardDiv.addEventListener(pointerdown, (event) => {
  console.log("board");
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

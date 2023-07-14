var game;

game = new Game(IratusBoard);

// ATTACHING EVENT LISTENERS

/* handle focus out of board */
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
    game.fenHistory.push(game.board.getFEN());
    game.backMovesHistory.length = 0;
    game.turn = lastMove.nextTurn;
    game.board.updateAllValidMoves();
    game.checkForEnd();
    game.updateDisplay();

    promotionWrapper.style.display = "none";

    let promotionPieces = document.getElementsByClassName("promotion-piece");
    for (let promotionPiece of promotionPieces) {
      promotionPiece.classList.remove(color + promotionPiece.classList[1]);
    }
  });
}

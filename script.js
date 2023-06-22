
try {

  const game = new Game(IratusBoard);

  setPiecesStyle();
  
  // ATTACHING EVENT LISTENERS
  
  document.addEventListener("pointerdown", event => {
  
    const boardDiv = document.getElementById("board-single");
    if (boardDiv.contains(event.target) && boardDiv !== event.target) {return}
  
    cancelPromotion();
    let selectedPiece = game.board.selectedPiece;
    if (selectedPiece) {
      selectedPiece.unselect()
    }
  });
  
  for (let promotionPiece of document.getElementsByClassName("promotion-piece")) {
    promotionPiece.addEventListener("pointerdown", event => {
      const color = game.board.pawnToPromote.color;
      lastMove = game.movesHistory.slice(-1)[0];
      lastMove.executeCommand(new Transform(game.board.pawnToPromote, Pawn, pieceClasses[promotionPiece.classList[1]]));
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
  
  document.getElementsByClassName("promotion-cancel")[0].addEventListener("pointerdown", cancelPromotion);

} catch (error) {
  console.error(error);
  alert(error);
}
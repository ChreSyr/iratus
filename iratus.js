

let game = new Game(IratusBoard);

function hideInfo() {
  let infoDiv = document.getElementById("info");
  infoDiv.style.visibility = "hidden";
  infoDiv.style.pointerEvents = "none";
}

function collide(event, element) {
  let rect = element.getBoundingClientRect();
  let x = event.clientX - rect.x;
  let y = event.clientY - rect.y;
  return x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
}

document.addEventListener("pointerdown", event => {
  let selectedHighlighter = document.querySelector(".selected");
  
  let boardDiv = document.getElementById("board-single");
  if (collide(event, boardDiv)) {
    return;
  }

  cancelPromotion();

  if (! selectedHighlighter) {return}
  let selectedPiece = selectedHighlighter.cell.piece;
  selectedPiece.unselect();
});

function makeDraggable(element) {
  let pos = {x: 0, y: 0};
  let dragging = false;
  let wasSelected = false;
  
  const stopScrollEvents = (event) => {
    event.preventDefault();
  }
      
  const pointerdownHandle = (event) => {
    cancelPromotion();
    if (! element.piece) {
      if (! element.highlighter.classList.contains("accessible")) {
        let selectedHighlighter = document.querySelector(".selected");
        if (selectedHighlighter) {
          selectedHighlighter.cell.piece.unselect();
        }
      }
      return;
    }
    if (element.highlighter.classList.contains("accessible")) {return}
    let rect = element.getBoundingClientRect();
    dragging = {dx: - rect.x - rect.width / 2, dy: - rect.y - rect.height / 2};
    pos.x = event.clientX + dragging.dx;
    pos.y = event.clientY + dragging.dy;
    element.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    element.classList.add('dragging');
    element.setPointerCapture(event.pointerId);

    wasSelected = element.highlighter.classList.contains("selected");
    element.piece.handlePointerDown();

    // dynamite
    if (element.piece && element.piece.dynamited) {
      element.extracell.style.backgroundImage = "";
      element.style.backgroundImage += ", url('images/" + element.piece.color + "dy.png')";
    }
  }
  
  const pointerupHandle = (event) => {
    dragging = null;
    element.classList.remove('dragging');
    element.style.transform = "";

    // dynamite
    if (element.piece && element.piece.dynamited) {
      element.style.backgroundImage = "url('images/" + element.piece.color + element.piece.ID + ".png')";
      element.extracell.style.backgroundImage = "url('images/" + element.piece.color + "dy.png')";
    }

    let allHighlighters = document.querySelectorAll(".highlighter");
    for (let highlighter of allHighlighters) {
      if (collide(event, highlighter)) {
        if (highlighter.classList.contains("accessible")) {
          let selectedPiece = document.querySelector(".selected").cell.piece;
          selectedPiece.unselect();
          game.move(start=[selectedPiece.row, selectedPiece.col], end=[parseInt(highlighter.dataset.row), parseInt(highlighter.dataset.col)])
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
    element.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
  }
  
  element.addEventListener('pointerdown', pointerdownHandle);
  element.addEventListener('pointerup', pointerupHandle);
  element.addEventListener('pointercancel', pointerupHandle);
  element.addEventListener('pointermove', pointermoveHandle);
  element.addEventListener('touchstart', stopScrollEvents);
}

for (let element of document.querySelectorAll(".cell")) {
  makeDraggable(element);
}

for (let promotionPiece of document.getElementsByClassName("promotion-piece")) {
  promotionPiece.addEventListener("pointerdown", event => {
    lastMove = game.movesHistory.slice(-1)[0];
    lastMove.executeCommand(new Transform(game.board.pawnToPromote, Pawn, pieceClasses[promotionPiece.classList[1]]));
    lastMove.notation += "=" + promotionPiece.classList[1].toUpperCase();
    game.board.pawnToPromote = null;
    game.board.updateAllValidMoves();
    game.checkForEnd();

    let promotionWindow = document.getElementsByClassName("promotion-window")[0];
    promotionWindow.style.visibility = "hidden";
    promotionWindow.style.pointerEvents = "none";
  });
}

const cancelPromotion = (event) => {
  if (game.board.pawnToPromote) {
    game.undo();
    game.board.pawnToPromote = null;
  
    let promotionWindow = document.getElementsByClassName("promotion-window")[0];
    promotionWindow.style.visibility = "hidden";
    promotionWindow.style.pointerEvents = "none";
  }
}
document.getElementsByClassName("promotion-cancel")[0].addEventListener("pointerdown", cancelPromotion);
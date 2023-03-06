

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
  if (! selectedHighlighter) {return}
  
  let boardDiv = document.getElementById("content");
  if (collide(event, boardDiv)) {
    return;
  }

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
  }
  
  const pointerupHandle = (event) => {
    dragging = null;
    element.classList.remove('dragging');
    element.style.transform = "";

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
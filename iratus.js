const iratusBoard = [
  ["", "", "", "", "", "", "", ""],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
  ["", "", "", "", "", "", "", ""],
];

const pieceClasses = {
  "K": null,
  "Q": null,
  "R": Rook,
  "B": null,
  "N": Knight,
  "P": null,
}

const board_ui = document.getElementById("board");
const highlighters = document.getElementById("highlighters");
const extracells = document.getElementById("extracells");
const cells = document.getElementById("cells");

let board = new Board();

for (let row = 0; row < 10; row++) {
  for (let col = 0; col < 8; col++) {
    const square = document.createElement("div");
    square.classList.add("square");
    square.dataset.row = row;
    square.dataset.col = col;
    // square.style.backgroundColor = "";
    // square.style.backgroundColor = (row + col) % 2 == 0 ? "white" : "black";
    board_ui.appendChild(square);
    
    const highlighter = document.createElement("div");
    highlighter.classList.add("highlighter");
    highlighter.dataset.row = row;
    highlighter.dataset.col = col;
    highlighters.appendChild(highlighter);
    square.highlighter = highlighter;

    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.row = row;
    cell.dataset.col = col;
    cell.style.backgroundColor = "rgb(0, 0, 0, 0)";
    if (iratusBoard[row][col] !== "") {
      const pieceClass = pieceClasses[iratusBoard[row][col]];
      if (pieceClass !== null) {
        cell.piece = new pieceClass(board, cell.dataset.row, cell.dataset.col, "w", cell);
      } else {
        cell.piece = null;
      }
    }
    cells.appendChild(cell);
    square.cell = cell;
    
    const extracell = document.createElement("div");
    extracell.classList.add("extracell");
    extracell.dataset.row = row;
    extracell.dataset.col = col;
    extracells.appendChild(extracell);
    cell.extracell = extracell;
  } 
}

let selectedPiece = null;

document.getElementsByClassName("mainzone")[0].addEventListener("click", event => {

  if (event.target.classList.contains("square")) {
    if (selectedPiece !== null && event.target.highlighter.classList.contains("accessible")) {
      selectedPiece.unselect();
      selectedPiece.goTo(event.target.dataset.row, event.target.dataset.col);
      selectedPiece = null;
    } else if (event.target.cell.piece) {
      selectedPiece = event.target.cell.piece;
      selectedPiece.handleClick();
    } else if (selectedPiece) {
      selectedPiece.unselect();
      selectedPiece = null;
    }
  } else if (selectedPiece) {
    selectedPiece.unselect();
    selectedPiece = null;
  }

});

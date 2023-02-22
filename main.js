const chessBoard = [
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
const cells = document.getElementById("cells");

let board = new Board();

for (let row = 0; row < 10; row++) {
  for (let col = 0; col < 8; col++) {
    const square = document.createElement("div");
    square.classList.add("square");
    square.dataset.row = row;
    square.dataset.col = col;
    square.style.backgroundColor = (row + col) % 2 == 0 ? "white" : "black";
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
    if (chessBoard[row][col] !== "") {
      const pieceClass = pieceClasses[chessBoard[row][col]];
      if (pieceClass !== null) {
        cell.piece = new pieceClass(board, cell, "w");
      } else {
        cell.piece = null;
      }
    }
    cells.appendChild(cell);
    square.cell = cell;
  }
}

let selectedPiece = null;

document.addEventListener("click", event => {
  if (event.target.classList.contains("square")) {

    if (event.target.cell.piece) {
      selectedPiece = event.target.cell.piece;
      selectedPiece.handleClick();
    } else if (selectedPiece) {
      selectedPiece.unselect();
      selectedPiece = null;
    }
  }
});

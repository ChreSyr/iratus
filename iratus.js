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

const squares = document.getElementById("squares");
const highlighters = document.getElementById("highlighters");
const extracells = document.getElementById("extracells");
const cells = document.getElementById("cells");

let game = new Game(IratusBoard);
let board = game.board;

for (let row = 0; row < 10; row++) {
  for (let col = 0; col < 8; col++) {
    const square = document.createElement("div");
    square.classList.add("square");
    square.dataset.row = row;
    square.dataset.col = col;
    // square.style.backgroundColor = "";
    // square.style.backgroundColor = (row + col) % 2 == 0 ? "white" : "black";
    squares.appendChild(square);
    
    const highlighter = document.createElement("div");
    highlighter.classList.add("highlighter");
    highlighter.dataset.row = row;
    highlighter.dataset.col = col;
    highlighters.appendChild(highlighter);
    highlighter.square = square;
    square.highlighter = highlighter;

    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.row = row;
    cell.dataset.col = col;
    cell.style.backgroundColor = "rgb(0, 0, 0, 0)";
    // cell.piece = game.board.piecesByPos[col * 10 + row];
    // if (game.board.piecesByPos[col * 10 + row] !== null) {
    //   console.log(game.board.piecesByPos[col * 10 + row]);
    // }
    // if (iratusBoard[row][col] !== "") {
    //   const pieceClass = pieceClasses[iratusBoard[row][col]];
    //   if (pieceClass !== null) {
    //     cell.piece = new pieceClass(board, cell.dataset.row, cell.dataset.col, cell);
    //   } else {
    //     cell.piece = null;
    //   }
    // }
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
game.board.initDisplay();

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

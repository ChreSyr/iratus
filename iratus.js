
// const squares = document.getElementById("squares");
// const highlighters = document.getElementById("highlighters");
// const extracells = document.getElementById("extracells");
// const cells = document.getElementById("cells");

let game = new Game(IratusBoard);
// let board = game.board;

// for (let row = 0; row < 10; row++) {
//   for (let col = 0; col < 8; col++) {
//     const square = document.createElement("div");
//     square.classList.add("square");
//     square.dataset.row = row;
//     square.dataset.col = col;
//     squares.appendChild(square);
    
//     const highlighter = document.createElement("div");
//     highlighter.classList.add("highlighter");
//     highlighter.dataset.row = row;
//     highlighter.dataset.col = col;
//     highlighters.appendChild(highlighter);
//     highlighter.square = square;
//     square.highlighter = highlighter;

//     const cell = document.createElement("div");
//     cell.classList.add("cell");
//     cell.dataset.row = row;
//     cell.dataset.col = col;
//     cell.style.backgroundColor = "rgb(0, 0, 0, 0)";
//     cells.appendChild(cell);
//     square.cell = cell;
    
//     const extracell = document.createElement("div");
//     extracell.classList.add("extracell");
//     extracell.dataset.row = row;
//     extracell.dataset.col = col;
//     extracells.appendChild(extracell);
//     cell.extracell = extracell;
//   } 
// }
// game.board.initDisplay();

let selectedPiece = null;

document.getElementsByClassName("mainzone")[0].addEventListener("click", event => {

  if (event.target.classList.contains("square")) {
    if (selectedPiece !== null && event.target.highlighter.classList.contains("accessible")) {
      selectedPiece.unselect();
      game.move(start=[selectedPiece.row, selectedPiece.col], end=[parseInt(event.target.dataset.row), parseInt(event.target.dataset.col)])
      // selectedPiece.goTo(event.target.dataset.row, event.target.dataset.col);
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

  console.log(game.board.king["w"].posIsUnderCheck(parseInt(event.target.dataset.row), parseInt(event.target.dataset.col)));

});

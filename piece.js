
const file_dict = {0:"a", 1:"b", 2:"c", 3:"d", 4:"e", 5:"f", 6:"g", 7:"h"}

class Piece {

  static ID = "";
  static MOVES = [];
  static ATTR_TO_COPY = ["ID", "MOVES"];
  static METH_TO_COPY = ["copy", "goTo", "capture", "redo", "uncapture", "undo", "updateValidMoves"];

  constructor(board, cell, color) {

    this.board = board;
    this.cell = cell;
    this.row = parseInt(cell.dataset.row);
    this.col = parseInt(cell.dataset.col);

    this.color = color;
    this.enemy_color = color === "b" ? "w" : "b";

    this.is_captured = false;

    // add the name of the piece to the cell's classes, then css places the appropriate image
    this.cell.classList.add(this.constructor.name.toLowerCase());  

    // for transformation memory
    this.actual_class = this.constructor;

    // Block the next widget's link by mouse  TODO : remove ?
    this.ignore_next_link = false;

    this.board.add_piece(this);

    console.log(this.getCoordinates())
  }
  
  getCoordinates() {
    return file_dict[this.col] + (this.board.NBRANKS - this.row);
  }

  getCell() {
    return this.cell;
  }

  getSquare() {
    const board = document.getElementById("board");
    return document.querySelector(`[data-row="${this.row}"][data-col="${this.col}"]`);
  }

  unselect() {
    this.getSquare().highlighter.classList.remove("selected");
    for (let square of document.querySelectorAll(".square")) {
      square.highlighter.classList.remove("accessible");
    }
  }

  handleClick() {
    let selectedCell = document.querySelector(".selected");
    if (selectedCell) {
      selectedCell.classList.remove("selected");
      if (selectedCell === this) {
        // click while already selected
        this.unselect();
        return;
      }
    }

    this.cell.classList.add("selected");
    const square = this.getSquare();
    this.highlightAccessibleSquares();
    square.highlighter.classList.add("selected");
  }

  highlightAccessibleSquares() {
    let accessibleMoves = this.getAccessibleMoves();
    let squares = document.querySelectorAll(".square");

    for (let square of squares) {
      let row = parseInt(square.dataset.row);
      let col = parseInt(square.dataset.col);

      if (accessibleMoves.find(move => move[0] === row && move[1] === col)) {
        square.highlighter.classList.add("accessible");
      } else {
        square.highlighter.classList.remove("accessible");
      }
    }
  }

  getAccessibleMoves() {
    let accessibleMoves = [];
    for (let i = 0; i < this.constructor.MOVES.length; i++) {
      let move = this.constructor.MOVES[i];
      let row = this.row + move[0];
      let col = this.col + move[1];
      console.log(move, row, col);
      if (row >= 0 && row <= 9 && col >= 0 && col <= 7) {
        accessibleMoves.push([row, col]);
      }
    }
    return accessibleMoves;
  }
  
  move(row, col) {
    this.row = row;
    this.col = col;
  }
  
}

  
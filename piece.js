
/*      Piece.getPos()
     ___ ___ ___ ___ ___ ___ ___ ___
10  |0  |10 |20 |30 |40 |50 |60 |70 |
    |___|___|___|___|___|___|___|___|
9   |1  |11 |21 |31 |41 |51 |61 |71 |
    |___|___|___|___|___|___|___|___|
8   |2  |12 |22 |32 |42 |52 |62 |72 |
    |___|___|___|___|___|___|___|___|
7   |3  |13 |23 |   |   |   |   |   |
    |___|___|___|___|___|___|___|___|
6   |4  |14 |24 |   |   |   |   |   |
    |___|___|___|___|___|___|___|___|
5   |5  |15 |25 |   |   |   |   |   |
    |___|___|___|___|___|___|___|___|
4   |6  |16 |26 |   |   |   |   |   |
    |___|___|___|___|___|___|___|___|
3   |7  |17 |27 |   |   |   |   |   |
    |___|___|___|___|___|___|___|___|
2   |8  |18 |28 |   |   |   |   |   |
    |___|___|___|___|___|___|___|___|
1   |9  |19 |29 |   |   |   |   |79 |
    |___|___|___|___|___|___|___|___|

      a   b   c   d   e   f   g   h
*/

const file_dict = {0:"a", 1:"b", 2:"c", 3:"d", 4:"e", 5:"f", 6:"g", 7:"h"}

class Piece {

  static ID = "";
  static MOVES = [];
  static ATTR_TO_COPY = ["ID", "MOVES"];
  static METH_TO_COPY = ["copy", "getAccessibleMoves", "goTo", "capture", "redo", "uncapture", "undo", "updateValidMoves"];

  constructor(board, row, col) {

    this.ID = this.constructor.ID;
    this.MOVES = this.constructor.MOVES;
    for (let meth of this.constructor.METH_TO_COPY) {
      this[meth] = this.constructor[meth];
    }

    this.board = board;
    this.row = parseInt(row);
    this.col = parseInt(col);

    this.color = row < 5 ? "w" : "b";
    this.enemy_color = this.color === "b" ? "w" : "b";

    this.cell = null;

    this.is_captured = false;

    // for transformation memory
    this.actualClass = this.constructor;

    this.dynamited = false;

    this.board.add_piece(this);
  }
  
  copyFrom(original) {
    this.is_captured = original.is_captured;
    if (this.is_captured) {return}

    this.board.set(this, original.square);

    if (this.getPos() !== original.getPos()) {
      this.goTo(original.row, original.col);
    }
  }

  getCoordinates() {
    return file_dict[this.col] + (this.board.NBRANKS - this.row);
  }

  getPos() {
    return this.col * 10 + this.row;
  }

  getSquare() {
    const board = document.getElementById("board");
    return document.querySelector(`[data-row="${this.row}"][data-col="${this.col}"]`);
  }
  
  static goTo(row, col) {
    this.row = parseInt(row);
    this.col = parseInt(col);
    if (this.is_captured) {return}

    if (this.cell !== null) {
      // update the display
      this.cell.style.backgroundImage = "";
      if (this.dynamited) {
        this.cell.extracell.style.backgroundImage = "";
      }
      this.cell.piece = null;
      this.cell = this.getSquare().cell;
      this.cell.style.backgroundImage = "url('images/" + this.color + this.ID + ".png')";
      if (this.dynamited) {
        this.cell.extracell.style.backgroundImage = "url('images/" + this.color + "dy.png')";
      }
      this.cell.piece = this;
    }
  }

  initDisplay() {
    this.cell = this.getSquare().cell;
    this.cell.piece = this;
    this.cell.style.backgroundImage = "url('images/" + this.color + this.ID + ".png')";
  }

  static preciseTransform(piece) {}
  
  transform(pieceClass) {
    if (this.actualClass === pieceClass) {return}

    let old_class = this.actualClass;
    this.actualClass = pieceClass;

    for (let attr of pieceClass.ATTR_TO_COPY) {
      this[attr] = pieceClass[attr];
    }
    for (let meth of pieceClass.METH_TO_COPY) {
      this[meth] = pieceClass[meth];
    }

    pieceClass.preciseTransform(this);

    if (this.cell !== null) {
      this.cell.style.backgroundImage = "url('images/" + this.color + this.ID + ".png')";

      // for calculations
      this.board.calculator.pieces_correspondence[this].transform(pieceClass);
    }
  }

  unselect() {
    this.getSquare().highlighter.classList.remove("selected");
    for (let square of document.querySelectorAll(".square")) {
      square.highlighter.classList.remove("accessible");
    }
  }

  handleClick() {
    let selectedHighlighter = document.querySelector(".selected");
    if (selectedHighlighter) {
      selectedHighlighter.classList.remove("selected");
      if (selectedHighlighter === this.getSquare().highlighter) {
        // click while already selected  TODO : solve, doesn't work yet
        this.unselect();

        if (this.actualClass.name.toLocaleLowerCase() === "knight") {
          this.transform(Rook);
        } else {
          this.transform(Knight);
        }

        return;
      }
    }

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

  static getAccessibleMoves() {
    let accessibleMoves = [];
    for (let i = 0; i < this.MOVES.length; i++) {
      let move = this.MOVES[i];
      let row = this.row + move[0];
      let col = this.col + move[1];
      if (row >= 0 && row <= 9 && col >= 0 && col <= 7) {
        accessibleMoves.push([row, col]);
      }
    }
    return accessibleMoves;
  }

}

  
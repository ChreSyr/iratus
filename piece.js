
/*      piece.getPos()
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

const fileDict = {0:"a", 1:"b", 2:"c", 3:"d", 4:"e", 5:"f", 6:"g", 7:"h"}

class Piece {

  static ID = "";
  static MOVES = [];
  static ATTR_TO_COPY = ["ID", "MOVES"];
  static METH_TO_COPY = ["capture", "copyFrom", "goTo", "redo", "uncapture", "undo", "updateValidMoves"];

  constructor(board, row, col) {

    this.ID = this.constructor.ID;
    this.MOVES = this.constructor.MOVES;
    for (let meth of this.constructor.METH_TO_COPY) {
      this[meth] = this.constructor[meth];
    }

    this.board = board;
    this.row = parseInt(row);
    this.col = parseInt(col);
    this.color = row > 5 ? "w" : "b";
    this.enemyColor = this.color === "b" ? "w" : "b";
    this.firstMove = null;
    this.validMoves = [];
    this.antikingSquares = [];
    this.isCaptured = false;
    this.dynamited = false;
    // for transformation memory
    this.actualClass = this.constructor;

    this.cell = null;

    this.board.addPiece(this);
  }
  
  canGoTo(row, col) {

    let piece = this.board.get(row, col);
    if (piece === null) {
      return true;
    } else if (piece.ID === "dy") {
      return piece.color === this.color;
    } else {
      return piece.color !== this.color;
    }
  }

  static capture(capturer) {

    let commands = [];

    this.board.piecesByPos[this.getPos()] = null;
    this.isCaptured = true;
    this.validMoves.length = 0;
    this.antikingSquares.length = 0;

    if (this.cell !== null) {
      // update the display
      this.cell.style.backgroundImage = "";
      if (this.dynamited) {
        this.cell.extracell.style.backgroundImage = "";
      }
      this.cell.piece = null;
    }

    if (this.dynamited && ! capturer.isCaptured) {
      commands.push(new Capture(capturer, this));
      commands.push(new NotationHint("*"));
    }

    // let alliedPhantom = this.board.phantoms[this.color];
    // if (! alliedPhantom.isCaptured) {
    //   commands.push(Transform(alliedPhantom, alliedPhantom.actualClass, this.actualClass));
    // }

    return commands;
  }

  capturerCheck() {
    return true;
  }

  static copyFrom(original) {
    this.isCaptured = original.isCaptured;
    if (this.isCaptured) {return}
    this.goTo(original.row, original.col);
  }

  getCoordinates() {
    return fileDict[this.col] + (this.board.NBRANKS - this.row);
  }

  static getPos(list) {
    return list[1] * 10 + list[0];
  }

  getPos() {
    return this.col * 10 + this.row;
  }

  getNextPos(validMove) {
    return (this.col + validMove[1]) * 10 + this.row + validMove[0];
  }

  getSquare() {
    return document.getElementById("squares").querySelector(`[data-row="${this.row}"][data-col="${this.col}"]`);
  }
  
  static goTo(row, col) {

    let commands = [];

    let oldPos = this.getPos();
    this.row = parseInt(row);
    this.col = parseInt(col);
    if (this.isCaptured) {return commands}

    this.board.piecesByPos[oldPos] = null;
    this.board.piecesByPos[this.getPos()] = this;

    if (this.firstMove === null) {
      this.firstMove = this.board.currentMove;
    }

    if (this.cell !== null) {  // update the display
     
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

    return commands;
  }

  hasMoved() {
    return this.firstMove !== null;
  }

  static preciseTransform(piece) {}

  static redo(row, col) {
    this.goTo(row, col);
  }
  
  setDynamite(val) {
    this.dynamited = val;

    // update the display
    if (this.cell !== null) {
      if (this.dynamited) {
        this.cell.extracell.style.backgroundImage = "url('images/" + this.color + "dy.png')";
      } else {
        this.cell.extracell.style.backgroundImage = "";
      }
    }
  }

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
      this.board.calculator.getSimulatedPiece(this).transform(pieceClass);
    }
  }

  static uncapture() {
    this.board.piecesByPos[this.getPos()] = this;
    this.isCaptured = false;

    if (this.cell !== null) {
      // update the display
      this.cell = this.getSquare().cell;
      this.cell.style.backgroundImage = "url('images/" + this.color + this.ID + ".png')";
      if (this.dynamited) {
        this.cell.extracell.style.backgroundImage = "url('images/" + this.color + "dy.png')";
      }
      this.cell.piece = this;
    }
  }

  /*
    def uncapture(self):
        # The board call this function when this piece was captured but "undo" is done

        # Memorizing the new position for the game
        assert self.board[self.square] == 0
        self.board[self.square] = self

        self.is_captured = False

        if self.widget is not None:
            self.widget.wake()

        if self.bonus is not None:
            self.bonus.handle_allyuncapture()
*/

  static undo(move) {
    this.goTo(move.start[0], move.start[1]);
    if (this.firstMove === move) {
      this.firstMove = null;
    }
  }

  static updateValidMoves() {

    if (this.isCaptured) {return}

    this.validMoves = [];
    this.antikingSquares = [];

    for (let i = 0; i < this.MOVES.length; i++) {
      let move = this.MOVES[i];
      let row = this.row + move[0];
      let col = this.col + move[1];
      if (row >= 0 && row <= 9 && col >= 0 && col <= 7) {
        this.antikingSquares.push([row, col]);
        if (this.canGoTo(row, col)) {
          this.validMoves.push([row, col]);
        }
      }
    }
  }

  // VIEW METHODS

  handlePointerDown() {

    let selectedHighlighter = document.querySelector(".selected");
    if (selectedHighlighter) {
      selectedHighlighter.classList.remove("selected");
    }

    const square = this.getSquare();
    square.highlighter.classList.add("selected");

    let squares = document.querySelectorAll(".square");

    if (this.board.game.turn !== this.color) {
      for (let square of squares) {
        square.highlighter.classList.remove("accessible");
      }
    } else {
      for (let square of squares) {
        let row = parseInt(square.dataset.row);
        let col = parseInt(square.dataset.col);
  
        if (this.validMoves.find(move => move[0] === row && move[1] === col)) {
          square.highlighter.classList.add("accessible");
        } else {
          square.highlighter.classList.remove("accessible");
        }
      }
    }
  }

  initDisplay() {
    this.cell = this.getSquare().cell;
    this.cell.piece = this;
    this.cell.style.backgroundImage = "url('images/" + this.color + this.ID + ".png')";
  }

  unselect() {
    this.getSquare().highlighter.classList.remove("selected");
    for (let square of document.querySelectorAll(".square")) {
      square.highlighter.classList.remove("accessible");
    }
  }

}

class PieceMovingTwice extends Piece {}
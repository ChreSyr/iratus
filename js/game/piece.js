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

// CONSTRUCTOR

function Piece(board, row, col) {
  this.ID = this.__proto__.ID;
  this.MOVES = this.__proto__.MOVES;
  this.RANGE = this.__proto__.RANGE;
  for (let meth of this.__proto__.METH_TO_COPY) {
    this[meth] = this.__proto__[meth];
  }

  this.board = board;
  this.row = parseInt(row);
  this.col = parseInt(col);
  this.color = row > 4 ? "w" : "b";
  this.enemyColor = this.color === "b" ? "w" : "b";
  this.firstMove = null;
  this.validMoves = [];
  this.antikingSquares = [];
  this.isCaptured = false;
  this.dynamited = false;
  // for transformation memory
  this.actualType = this.__proto__;

  this.isWidgeted = false;
  this.widget = null;
  this.cssClass = undefined;

  // only used by calculation pieces
  this.original = undefined;

  this.board.addPiece(this);
}

// NON-HERITABLE METHODS

(Piece.getPos = function (list) {
  return list[1] * 10 + list[0];
}),
  (Piece.preciseTransform = function (piece) {});

// ROOT PROTOTYPE

Piece.prototype = {
  // STATIC VALUES

  // Attributes to override
  ID: "",
  MOVES: [],
  RANGE: 0,

  // these are used for piece.transform()
  ATTR_TO_COPY: ["ID", "MOVES", "RANGE"],
  METH_TO_COPY: [
    "canGoTo",
    "capture",
    "capturerCheck",
    "copyFrom",
    "goTo",
    "redo",
    "uncapture",
    "undo",
    "updateValidMoves",
  ],

  // INSTANCE METHODS - MECHANICS
  canGoTo: function (row, col) {
    const piece = this.board.get(row, col);
    if (piece === null) {
      return true;
    } else if (piece.ID === "dy") {
      return piece.color === this.color && !Dynamite.UNDYNAMITABLES.includes(this.ID);
    } else {
      return piece.color !== this.color;
    }
  },

  capture: function (capturer) {
    let commands = [];

    this.board.piecesByPos[this.getPos()] = null;
    this.isCaptured = true;
    this.validMoves.length = 0;
    this.antikingSquares.length = 0;

    if (this.isWidgeted) {
      // update the display
      this.killWidget();
    }

    if (this.dynamited && !capturer.isCaptured) {
      commands.push(new Capture(capturer, this));
      commands.push(new NotationHint("*"));
    }

    let alliedPhantom = this.board.phantom[this.color];
    if (!alliedPhantom.isCaptured) {
      commands.push(new Transform(alliedPhantom, alliedPhantom.actualType, this.actualType));
    }

    return commands;
  },

  capturerCheck: function () {
    return true;
  },

  copyFrom: function (original) {
    this.isCaptured = original.isCaptured;
    if (this.isCaptured) {
      return;
    }

    this.row = original.row;
    this.col = original.col;
    this.board.piecesByPos[this.getPos()] = this;
    this.firstMove = original.firstMove;
    this.dynamited = original.dynamited;
    this.original = original;
  },

  getCoordinates: function () {
    return fileDict[this.col] + (this.board.nbranks - this.row);
  },

  getPos: function () {
    return this.col * 10 + this.row;
  },

  getNextPos: function (validMove) {
    return (this.col + validMove[1]) * 10 + this.row + validMove[0];
  },

  getSquare: function () {
    return document
      .getElementById("squares")
      .querySelector(`[data-row="${this.row}"][data-col="${this.col}"]`);
  },

  goTo: function (row, col) {
    let commands = [];

    let oldPos = this.getPos();
    this.row = parseInt(row);
    this.col = parseInt(col);
    if (this.isCaptured) {
      return commands;
    }

    this.board.piecesByPos[oldPos] = null;
    this.board.piecesByPos[this.getPos()] = this;

    if (this.firstMove === null) {
      this.firstMove = this.board.currentMove;
    }

    // update the display
    if (this.widget !== null) {
      this.widget.classList.remove("square-" + oldPos);
      this.widget.classList.add("square-" + this.getPos());
    }

    return commands;
  },

  hasMoved: function () {
    return this.firstMove !== null;
  },

  preciseTransform: function (piece) {},

  redo: function (row, col) {
    this.goTo(row, col);
  },

  setDynamite: function (val) {
    this.dynamited = val;

    // update the display
    if (this.widget !== null) {
      if (this.dynamited) {
        this.widget.classList.add("dynamited");
      } else {
        this.widget.classList.remove("dynamited");
      }
    }
  },

  transform: function (pieceClass) {
    if (this.actualType === pieceClass) {
      return;
    }

    let oldClass = this.actualType;
    this.actualType = pieceClass;

    for (let attr of pieceClass.ATTR_TO_COPY) {
      this[attr] = pieceClass[attr];
    }
    for (let meth of pieceClass.METH_TO_COPY) {
      this[meth] = pieceClass[meth];
    }

    pieceClass.preciseTransform(this);

    if (this.widget !== null) {
      this.widget.classList.remove(this.color + oldClass.ID);
      this.widget.classList.add(this.color + this.ID);

      // for calculations
      this.board.calculator.getSimulatedPiece(this).transform(pieceClass);
    }
  },

  uncapture: function () {
    this.board.piecesByPos[this.getPos()] = this;
    this.isCaptured = false;

    if (this.isWidgeted) {
      // update the display
      this.createWidget();
    }
  },

  undo: function (move) {
    this.goTo(move.start[0], move.start[1]);
    if (this.firstMove === move) {
      this.firstMove = null;
    }
  },

  updateValidMoves: function () {
    if (this.isCaptured) {
      return;
    }

    this.validMoves = [];
    this.antikingSquares = [];

    for (let move of this.MOVES) {
      let row = this.row + move[0];
      let col = this.col + move[1];

      if (row < 0 || row > 9 || col < 0 || col > 7) {
        continue;
      }

      this.antikingSquares.push([row, col]);
      if (this.canGoTo(row, col)) {
        this.validMoves.push([row, col]);
      }
    }
  },

  // INSTANCE METHODS - VIEW

  createWidget: function () {
    if (this.isWidgeted === false) {
      throw Error("Can't widgetize a piece made for calculation");
    }
    if (this.widget !== null) {
      throw Error("This piece already has a widget");
    }

    this.widget = document.createElement("div");
    this.widget.classList.add("piece");
    this.widget.classList.add(this.color + this.ID);
    this.widget.classList.add("square-" + this.getPos());
    if (this.cssClass === "phantom") {
      this.widget.classList.add("phantom");
    }
    if (this.dynamited) {
      // happens when uncapture
      this.widget.classList.add("dynamited");
    }
    this.widget.piece = this;
    makePieceDraggable(this.widget);
    this.board.widget.appendChild(this.widget);
  },

  handlePointerDown: function () {
    if (this.board.selectedPiece !== null) {
      this.board.selectedPiece.unselect();
    }

    const squareSelected = document.createElement("div");
    squareSelected.classList.add("square");
    squareSelected.classList.add("selected");
    squareSelected.classList.add("square-" + this.getPos());
    this.board.widget.appendChild(squareSelected);
    this.board.squareSelected = squareSelected;

    this.board.selectedPiece = this;

    if (this.board.game.turn !== this.color) {
      return;
    }

    for (let validMove of this.validMoves) {
      const movePos = validMove[1] * 10 + validMove[0];
      const squareAccessible = document.createElement("div");
      squareAccessible.classList.add("square");
      squareAccessible.classList.add("accessible");
      if (this.board.piecesByPos[movePos] !== null) {
        squareAccessible.classList.add("captureable");
      }
      squareAccessible.classList.add("square-" + movePos);
      squareAccessible.dataset.row = validMove[0];
      squareAccessible.dataset.col = validMove[1];
      makeSquareClickable(squareAccessible);
      this.board.widget.appendChild(squareAccessible);
      this.board.squaresAccessible.push(squareAccessible);
    }
  },

  killWidget() {
    if (this.widget === null) {
      return;
    }

    this.widget.remove();
    this.widget = null;
  },

  unselect: function () {
    if (this.board.selectedPiece === null) {
      return;
    }

    this.board.squareSelected.classList.remove("square-" + this.board.selectedPiece.getPos());
    this.board.squareSelected.remove();
    this.board.squareSelected = null;

    this.board.selectedPiece = null;

    for (let squareAccessible of this.board.squaresAccessible) {
      squareAccessible.remove();
    }
    this.board.squaresAccessible.length = 0;
  },
};

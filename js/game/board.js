
const pieceClassesByID = {
  "k": King,
  "q": Queen,
  "r": Rook,
  "b": Bishop,
  "n": Knight,
  "i": Pawn,
  "dy": Dynamite,
  "s": Soldier,
  "es": EliteSoldier,
  "d": Dog,
  "ed": EnragedDog,
  "p": Phantom,
  "g": Grapple,
  " ": null,
}

// CONSTRUCTOR

function Board(game, nbranks = 8, nbfiles = 8) {
  this.game = game;
  this.nbfiles = nbfiles;
  this.nbranks = nbranks;
  this.piecesByPos = new Array(nbfiles * nbranks).fill(null);
  this.pieces = [];
  this.piecesColored = { "w": [], "b": [] };
  this.king = {};
  this.pawnToPromote = null;
  this.calculator = null;
  this.calculatorClass = null;
  this.fatPositionClass = null;
  this.widget = null;
  this.selectedPiece = null;
  this.squareSelected = null;
  this.squaresAccessible = [];
  this.currentMove = null;
  this.mainCurrentMove = null;

  // Initialization
  this.createPieces();
}

// ROOT PROTOTYPE

Board.prototype = {

  addPiece: function (piece) {
    this.pieces.push(piece);
    this.piecesByPos[piece.getPos()] = piece;
    this.piecesColored[piece.color].push(piece);

    if (piece.ID === "k") {
      this.king[piece.color] = piece;
    }
  },

  createPieces: function() {},

  get: function (row, col) {
    return this.piecesByPos[col * 10 + row];
  },

  getFatPosition: function () {
    return new FatPosition(this, this.game.turn);
  },

  initDisplay: function () {
    this.calculator = new this.calculatorClass(this);

    this.widget = document.getElementById("board-single");

    for (let piece of this.pieces) {
      piece.isWidgeted = true;
      piece.createWidget();
    }
  },

  move: function (start, end, main = true) {
    if (typeof start === "number") {
      start = [start % 10, Math.floor(start / 10)];
    }
    if (typeof end === "number") {
      end = [end % 10, Math.floor(end / 10)];
    }

    let currentMove = new Move(this, start, end);
    this.currentMove = currentMove;
    if (main) {
      this.mainCurrentMove = this.currentMove;
    }

    this.currentMove.executeCommand(MainMove());

    return currentMove;
  },

  redo: function (move, main = true) {
    this.currentMove = move;
    if (main) {
      this.mainCurrentMove = this.currentMove;
    }
    move.redoCommands();
  },

  undo: function (move) {
    for (let command of [...move.commands].reverse()) {
      move.undoCommand(command);
    }
  },

  updateAllValidMoves: function () {},
};
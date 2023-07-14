const pieceClassesByID = {
  k: King,
  q: Queen,
  r: Rook,
  b: Bishop,
  n: Knight,
  p: Pawn,
  y: Dynamite,
  s: Soldier,
  e: EliteSoldier,
  d: Dog,
  c: EnragedDog,
  f: Phantom,
  g: Grapple,
  " ": null,
};

// CONSTRUCTOR

function Board(game, nbranks = 8, nbfiles = 8) {
  this.game = game;
  this.nbfiles = nbfiles;
  this.nbranks = nbranks;
  this.startFEN = {};
  this.piecesByPos = new Array(nbfiles * nbranks).fill(null);
  this.pieces = [];
  this.piecesColored = { w: [], b: [] };
  this.king = {};
  this.pawnToPromote = null;
  this.calculator = null;
  this.calculatorClass = null;
  this.widget = null;
  this.selectedPiece = null;
  this.squareSelected = null;
  this.squaresAccessible = [];
  this.currentMove = null;
  this.mainCurrentMove = null;

  // Initialization
  try {
    this.createPieces();
  } catch (error) {
    this.error = error;
  }
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

  createPieces: function () {},

  get: function (row, col) {
    return this.piecesByPos[col * 10 + row];
  },

  getFEN: function () {
    return new FEN(this, this.game.turn);
  },

  initDisplay: function () {
    this.calculator = new this.calculatorClass(this);

    this.widget = document.getElementById("board-single");

    if (this.error) {
      const errorContainer = document.createElement("div");
      errorContainer.classList.add("error-container");
      const errorMsg = document.createElement("h3");
      errorMsg.classList.add("error-message");
      errorMsg.innerText = this.error.message;
      errorContainer.appendChild(errorMsg);
      const errorReloader = document.createElement("button");
      errorReloader.classList.add("error-button");
      errorReloader.innerText = "Réinitialiser";
      errorReloader.addEventListener("click", (event) => {
        this.game.loadFEN(IratusBoard.emptyFEN);
      });
      errorContainer.appendChild(errorReloader);
      this.widget.appendChild(errorContainer);
      document.querySelector(".board-overlay").style.display = "block";
      return;
    }

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

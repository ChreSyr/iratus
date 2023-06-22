
alert("board");

class Board {

  static NBRANKS = 8;
  static NBFILES = 8;

  constructor(game) {

    this.game = game;
    this.NBFILES = this.constructor.NBFILES;
    this.NBRANKS = this.constructor.NBRANKS;

    this.piecesByPos = new Array(this.NBFILES * this.NBRANKS).fill(null);
    this.pieces = [];
    this.piecesColored = {"w": [], "b": []};
    this.king = {};
    this.pawnToPromote = null;

    this.calculator = null;
    this.calculatorClass = null;
    this.fatPositionClass = null;
    this.createPieces();

    this.widget = null;
    this.selectedPiece = null;
    this.squareSelected = null;
    this.squaresAccessible = [];

    this.currentMove = null;
    this.mainCurrentMove = null;
  }

  addPiece(piece) {
    this.pieces.push(piece);
    this.piecesByPos[piece.getPos()] = piece;
    this.piecesColored[piece.color].push(piece);

    if (piece.ID === "k") {
      this.king[piece.color] = piece;
    }
  }

  createPieces() {}

  get(row, col) {
    return this.piecesByPos[col * 10 + row];
  }

  getFatPosition() {  // for the fatHistory
    return new FatPosition(this, this.game.turn);
  }
  
  initDisplay() {
    this.calculator = new this.calculatorClass(this);

    this.widget = document.getElementById("board-single");
    
    for (let piece of this.pieces) {
      piece.isWidgeted = true;
      piece.createWidget();
    }
  }
  
  move(start, end, main=true) {
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
    this.currentMove.executeCommand(new MainMove());

    return currentMove;  // need to return currentMove, not this.currentMove
  }

  redo(move, main=true) {
    this.currentMove = move;
    if (main) {
      this.mainCurrentMove = this.currentMove;
    }
    move.redoCommands();
  }

  undo(move) {
    for (let command of [...move.commands].reverse()) {
      move.undoCommand(command)
    }
  }
  
  updateAllValidMoves() {}
}

class FatPosition {
  // Stores a full chess position
  _EQ_ATTRIBUTES = ["castleRights", "turn"];

  constructor(board, turn) {
    this.piecesByPos = [
      null, null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null, null,
    ];

    for (let piece of board.pieces) {
      if (! piece.isCaptured) {
        this.piecesByPos[piece.getPos()] = piece.ID;
      }
    }

    this.casteRights = board.king["w"].castleRights + board.king["b"].castleRights;
    this.turn = turn;
  }
  
  equals(other) {
    // NOTE : according to FIDE rules, I should check if en passant abilities are the same

    for (let attr of this._EQ_ATTRIBUTES) {
      if (this[attr] !== other[attr]) {
        return false;
      }
    }

    function arraysEqual(a, b) {
      if (a === b) return true;
      if (a == null || b == null) return false;
      if (a.length !== b.length) return false;
      for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }

    return arraysEqual(this.piecesByPos, other.piecesByPos);
  }
}

let pieceClasses = {
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

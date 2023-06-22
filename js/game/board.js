
alert('Board');

class Board {

  static pieceClassesByID = {
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
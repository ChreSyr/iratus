// CONSTRUCTOR

function Grapple(board, color, row, col) {
  RollingPiece.call(this, board, color, row, col);
}

// INHERITANCE

Grapple.prototype = Object.create(RollingPiece.prototype);
Grapple.prototype.constructor = Grapple;

// STATIC VALUES

Grapple.RELATIVE_VALUE = 5;

Grapple.prototype.ID = "g";
Grapple.prototype.MOVES = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

// INSTANCE METHODS - MECHANICS

Grapple.prototype.canGoTo = function (row, col) {
  let piece = this.board.get(row, col);
  if (piece === null) {
    return true;
  } else if (piece.ID === "y") {
    return false;
  } else {
    return true;
  }
};

Grapple.prototype.capturerCheck = function () {
  return false;
};

Grapple.prototype.goTo = function (row, col) {
  let grappledPiece = this.board.get(row, col);
  if (!grappledPiece) {
    return RollingPiece.prototype.goTo.call(this, row, col);
  }
  const getCoord = (piece) => fileDict[piece.col] + (this.board.nbranks - piece.row - 1);
  let commands = [];

  let notation = "G:";
  if (grappledPiece.ID !== "p") {
    notation += grappledPiece.ID.toUpperCase();
  }
  notation += getCoord(grappledPiece) + "->" + getCoord(this); // ex : G:Nf6->d4
  commands.push(new Notation(notation));
  commands.push(new Capture(this, this));
  commands.push(new AfterMove([grappledPiece.row, grappledPiece.col], [this.row, this.col]));
  if (grappledPiece.dynamited) {
    commands.push(new Capture(grappledPiece, this));
  }
  return commands;
};

Grapple.prototype.updateValidMoves = function () {
  RollingPiece.prototype.updateValidMoves.call(this);
  this.antikingSquares.length = 0;
};

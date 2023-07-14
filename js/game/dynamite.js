// CONSTRUCTOR

function Dynamite(board, color, row, col) {
  Piece.call(this, board, color, row, col);
}

Dynamite.DYNAMITABLES = ["p", "n", "b", "d", "s"];

// INHERITANCE

Dynamite.RELATIVE_VALUE = 2;

Dynamite.prototype = Object.create(Piece.prototype);
Dynamite.prototype.constructor = Dynamite;

// STATIC VALUES

Dynamite.prototype.ID = "y";

// INSTANCE METHODS - MECHANICS

Dynamite.prototype.capture = function (capturer) {
  let commands = Piece.prototype.capture.call(this, this, capturer);
  commands.splice(
    commands.indexOf(commands.find((commandToRem) => commandToRem.name === "transform"))
  ); // remove phantomisation
  if (capturer !== this) {
    // when an ally goes to the dynamite
    commands.push(new SetDynamite(capturer));
  }
  return commands;
};

Dynamite.prototype.capturerCheck = function () {
  return false;
};

Dynamite.prototype.copyFrom = function (original) {
  this.isCaptured = original.isCaptured;
  if (this.isCaptured) {
    return;
  }
  this.board.piecesByPos[original.getPos()] = this;
};

Dynamite.prototype.goTo = function (row, col) {
  // when the dynamite goes to an ally
  let commands = [];
  commands.push(new Capture(this, this));
  commands.push(new SetDynamite(this.board.get(row, col)));
  return commands;
};

Dynamite.prototype.updateValidMoves = function () {
  if (this.isCaptured) {
    return;
  }

  this.validMoves = [];

  for (let piece of this.board.piecesColored[this.color]) {
    if (piece.isCaptured) {
      continue;
    }
    if (piece.dynamited) {
      continue;
    }
    if (!Dynamite.DYNAMITABLES.includes(piece.ID)) {
      continue;
    }
    if (piece.__proto__.ID === "f") {
      continue;
    }
    if (!piece.hasMoved()) {
      this.validMoves.push([piece.row, piece.col]);
    }
  }
};

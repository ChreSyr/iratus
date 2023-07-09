// CONSTRUCTOR

function Rook(board, color, row, col) {
  RollingPiece.call(this, board, color, row, col);

  // By default, a rook has moved.
  // If there is a cstle right with that rook from fen, the rook has not moved
  this.firstMove = "done";
}

// INHERITANCE

Rook.prototype = Object.create(RollingPiece.prototype);
Rook.prototype.constructor = Rook;

// STATIC VALUES

Rook.prototype.ID = "r";
Rook.prototype.MOVES = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

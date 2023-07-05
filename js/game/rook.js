// CONSTRUCTOR

function Rook(board, row, col) {
  RollingPiece.call(this, board, row, col);
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

// CONSTRUCTOR

function Queen(board, row, col) {
  RollingPiece.call(this, Queen, board, row, col);
}

// INHERITANCE

Queen.prototype = Object.create(RollingPiece.prototype);
Queen.prototype.constructor = Queen;

// STATIC VALUES

Queen.prototype.ID = "q";
Queen.prototype.MOVES = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

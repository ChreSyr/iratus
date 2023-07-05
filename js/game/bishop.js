// CONSTRUCTOR

function Bishop(board, row, col) {
  RollingPiece.call(this, board, row, col);
}

// INHERITANCE

Bishop.prototype = Object.create(RollingPiece.prototype);
Bishop.prototype.constructor = Bishop;

// STATIC VALUES

Bishop.prototype.ID = "b";
Bishop.prototype.MOVES = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

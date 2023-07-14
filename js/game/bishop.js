// CONSTRUCTOR

function Bishop(board, color, row, col) {
  RollingPiece.call(this, board, color, row, col);
}

// INHERITANCE

Bishop.RELATIVE_VALUE = 4;

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

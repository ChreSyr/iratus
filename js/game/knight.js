// CONSTRUCTOR

function Knight(board, color, row, col) {
  Piece.call(this, board, color, row, col);
}

// INHERITANCE

Knight.prototype = Object.create(Piece.prototype);
Knight.prototype.constructor = Knight;

// STATIC VALUES

Knight.RELATIVE_VALUE = 3;

Knight.prototype.ID = "n";
Knight.prototype.MOVES = [
  [2, 1],
  [2, -1],
  [-2, 1],
  [-2, -1],
  [1, 2],
  [1, -2],
  [-1, 2],
  [-1, -2],
];

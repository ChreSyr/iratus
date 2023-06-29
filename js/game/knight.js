// CONSTRUCTOR

function Knight(board, row, col) {
  Piece.call(this, Knight, board, row, col);
}

// INHERITANCE

Knight.prototype = Object.create(Piece.prototype);
Knight.prototype.constructor = Knight;

// STATIC VALUES

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

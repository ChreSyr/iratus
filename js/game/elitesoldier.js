// CONSTRUCTOR

function EliteSoldier(board, color, row, col) {
  PieceMovingTwice.call(this, board, color, row, col);
}

// INHERITANCE

EliteSoldier.prototype = Object.create(PieceMovingTwice.prototype);
EliteSoldier.prototype.constructor = EliteSoldier;

// STATIC VALUES

EliteSoldier.prototype.ID = "es";
EliteSoldier.prototype.MOVES = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

// CONSTRUCTOR

function EliteSoldier(board, row, col) {
  PieceMovingTwice.call(this, board, row, col);
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

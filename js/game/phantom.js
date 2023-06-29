// CONSTRUCTOR

function Phantom(board, row, col) {
  Piece.call(this, Phantom, board, row, col);

  this.cssClass = "phantom";
}

Phantom.UNDYNAMITABLES = ["k", "q", "r", "dy", "p", "g"];

// INHERITANCE

Phantom.prototype = Object.create(Piece.prototype);
Phantom.prototype.constructor = Phantom;

// STATIC VALUES

Phantom.prototype.ID = "p";

// INSTANCE METHODS - MECHANICS

Phantom.prototype.canGoTo = function (row, col) {
  let piece = this.board.get(row, col);
  if (piece === null) {
    return true;
  } else if (piece.ID === "dy") {
    return false;
  } else {
    return piece.color !== this.color;
  }
};

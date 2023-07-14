// CONSTRUCTOR

function Phantom(board, color, row, col) {
  Piece.call(this, board, color, row, col);

  this.cssClass = "phantom";
}

// INHERITANCE

Phantom.prototype = Object.create(Piece.prototype);
Phantom.prototype.constructor = Phantom;

// STATIC VALUES

Phantom.prototype.ID = "f";

// INSTANCE METHODS - MECHANICS

Phantom.prototype.canGoTo = function (row, col) {
  let piece = this.board.get(row, col);
  if (piece === null) {
    return true;
  } else if (piece.ID === "y") {
    return false;
  } else {
    return piece.color !== this.color;
  }
};

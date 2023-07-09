// CONSTRUCTOR

function EnragedDog(board, color, row, col) {
  PieceMovingTwice.call(this, board, color, row, col);
}

// INHERITANCE

EnragedDog.prototype = Object.create(PieceMovingTwice.prototype);
EnragedDog.prototype.constructor = EnragedDog;

// STATIC ATTRIBUTES

EnragedDog.prototype.ID = "c";
EnragedDog.prototype.MOVES = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

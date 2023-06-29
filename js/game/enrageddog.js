// CONSTRUCTOR

function EnragedDog(board, row, col) {
  PieceMovingTwice.call(this, EnragedDog, board, row, col);
}

// INHERITANCE

EnragedDog.prototype = Object.create(PieceMovingTwice.prototype);
EnragedDog.prototype.constructor = EnragedDog;

// STATIC ATTRIBUTES

EnragedDog.prototype.ID = "ed";
EnragedDog.prototype.MOVES = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

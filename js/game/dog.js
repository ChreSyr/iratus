// CONSTRUCTOR

function Dog(board, row, col) {
  Piece.call(this, board, row, col);

  if (col > 3) {
    this.linkedPiece = this.board.get(row, col - 1);
    this.linkedPiece.linkedPiece = this;
  }
}

// INHERITANCE

Dog.prototype = Object.create(Piece.prototype);
Dog.prototype.constructor = Dog;

// STATIC VALUES

Dog.prototype.ID = "d";

// INSTANCE METHODS - MECHANICS

Dog.prototype.capture = function (capturer) {
  let commands = Piece.prototype.capture.call(this, capturer);

  if (!this.linkedPiece.isCaptured) {
    // If the dog is captured while its soldier is alive, the phantom is an enraged dog
    for (let command of commands) {
      if (command.name === "transform") {
        command.args[2] = EnragedDog.prototype; // a captured dog creates an enrageddog's phantom
      }
    }
    commands.push(new Capture(this.linkedPiece, capturer));
  }

  return commands;
};

Dog.prototype.goTo = function (row, col) {
  let startRow = this.row,
    startCol = this.col;
  let commands = Piece.prototype.goTo.call(this, row, col);

  if (dogIsTooFar(this.linkedPiece.row, this.linkedPiece.col, this.row, this.col)) {
    // happens when pulled by the grapple
    commands.push(
      new AfterMove(
        [this.linkedPiece.row, this.linkedPiece.col],
        getNewDogRC(startRow, startCol, this.row, this.col)
      )
    );
  }
  return commands;
};

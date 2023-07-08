// CONSTRUCTOR

function EliteSoldier(board, row, col) {
  // TODO : elite soldier is not linkedPiece, cause the dog enrages when the soldier promotes
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

// INSTANCE METHODS - MECHANICS

EliteSoldier.prototype.preciseTransform = function (piece) {
  if (!piece instanceof EliteSoldier) {
    piece.dog = null;
    piece.linkedPiece = null;
  }
};

EliteSoldier.prototype.capture = function (capturer) {
  let commands = PieceMovingTwice.prototype.capture.call(this, capturer);

  if (!this.dog) {
    return commands;
  } // happens when this is the phantom or a promoted pawn

  if (!this.dog.isCaptured) {
    commands.push(new Transform(this.dog, this.dog.actualType, EnragedDog.prototype)); // enrage dog
  } else {
    commands.splice(
      commands.indexOf(commands.find((commandToRem) => commandToRem.name === "transform"))
    ); // remove leash phantomisation, stays dog
  }

  return commands;
};

EliteSoldier.prototype.goTo = function (row, col) {
  let startRow = this.row,
    startCol = this.col;
  let commands = PieceMovingTwice.prototype.goTo.call(this, row, col);

  if (!this.dog) {
    return commands;
  } // happens when this is the phantom or a promoted pawn

  if (dogIsTooFar(this.row, this.col, this.dog.row, this.dog.col)) {
    commands.push(
      new AfterMove(
        [this.dog.row, this.dog.col],
        getNewDogRC(startRow, startCol, this.row, this.col)
      )
    );
  }

  return commands;
};

EliteSoldier.prototype.updateValidMoves = function () {
  PieceMovingTwice.prototype.updateValidMoves.call(this);

  if (this.dog) {
    let squareToRemove = [this.dog.row, this.dog.col];
    this.antikingSquares = this.antikingSquares.filter(
      (arr) => JSON.stringify(arr) !== JSON.stringify(squareToRemove)
    );
  }
};

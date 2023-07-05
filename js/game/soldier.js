// CONSTRUCTOR

function Soldier(board, row, col) {
  RollingPiece.call(this, board, row, col);

  this.dog = undefined;

  if (col < 4) {
    this.dog = board.get(row, col - 1);
    this.dog.soldier = this;
  }

  Soldier.prototype.preciseTransform(this);
}

// INHERITANCE

Soldier.prototype = Object.create(RollingPiece.prototype);
Soldier.prototype.constructor = Soldier;

// STATIC VALUES

Soldier.prototype.ID = "s";
Soldier.prototype.RANGE = 2;

// INSTANCE METHODS - MECHANICS

Soldier.prototype.canGoTo = function (row, col) {
  let piece = this.board.get(row, col);
  if (piece === null) {
    return true;
  } else if (piece.ID === "dy") {
    return piece.color === this.color && !Dynamite.UNDYNAMITABLES.includes(this.ID);
  } else {
    return piece.color !== this.color && piece.ID === "i"; // only captures pawns
  }
};

Soldier.prototype.capture = function (capturer) {
  let commands = RollingPiece.prototype.capture.call(this, capturer);

  if (!this.dog) {
    return commands;
  } // happens when this is the phantom

  if (!this.dog.isCaptured) {
    commands.push(new Transform(this.dog, this.dog.actualClass, EnragedDog.prototype)); // enrage dog
  } else {
    commands.splice(
      commands.indexOf(commands.find((commandToRem) => commandToRem.name === "transform"))
    ); // remove leash phantomisation, stays dog
  }

  return commands;
};

Soldier.prototype.goTo = function (row, col) {
  let startRow = this.row,
    startCol = this.col;
  let commands = RollingPiece.prototype.goTo.call(this, row, col);

  if (!this.dog) {
    return commands;
  } // happens when this is the phantom

  if (this.row === this.promotionRank) {
    commands.push(new Transform(this, this.actualClass, EliteSoldier.prototype));
  }

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

Soldier.prototype.preciseTransform = function (piece) {
  if (!piece instanceof Soldier) {
    piece.dog = null;
  }

  if (piece.color === "b") {
    piece.MOVES = [
      [1, 1],
      [1, -1],
    ];
    piece.promotionRank = 9;
  } else {
    piece.MOVES = [
      [-1, 1],
      [-1, -1],
    ];
    piece.promotionRank = 0;
  }
};

Soldier.prototype.updateValidMoves = function () {
  RollingPiece.prototype.updateValidMoves.call(this);

  this.antikingSquares = [];
};

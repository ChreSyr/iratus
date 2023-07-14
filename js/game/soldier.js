// CONSTRUCTOR

function Soldier(board, color, row, col) {
  RollingPiece.call(this, board, color, row, col);

  Soldier.prototype.preciseTransform(this);
}

// INHERITANCE

Soldier.prototype = Object.create(RollingPiece.prototype);
Soldier.prototype.constructor = Soldier;

// STATIC VALUES

Soldier.RELATIVE_VALUE = 2;

Soldier.prototype.ID = "s";
Soldier.prototype.RANGE = 2;

// INSTANCE METHODS - MECHANICS

Soldier.prototype.canGoTo = function (row, col) {
  let piece = this.board.get(row, col);
  if (piece === null) {
    return true;
  } else if (piece.ID === "y") {
    return piece.color === this.color && Dynamite.DYNAMITABLES.includes(this.ID);
  } else {
    return piece.color !== this.color && piece.ID === "p"; // only captures pawns
  }
};

Soldier.prototype.capture = function (capturer) {
  let commands = RollingPiece.prototype.capture.call(this, capturer);

  if (!this.linkedPiece) {
    // If this is the phantom of the soldier
    return commands;
  }

  if (!this.linkedPiece.isCaptured) {
    // If the dog is still alive when the soldier is captured
    commands.push(
      new Transform(this.linkedPiece, this.linkedPiece.actualType, EnragedDog.prototype)
    );
  } else {
    // Else, the soldier dies right after its dog.
    // In this case, the dog is phantomized, not the soldier
    commands.splice(
      commands.indexOf(commands.find((commandToRem) => commandToRem.name === "transform"))
    );
  }

  return commands;
};

Soldier.prototype.goTo = function (row, col) {
  let startRow = this.row,
    startCol = this.col;
  let commands = RollingPiece.prototype.goTo.call(this, row, col);

  if (!this.linkedPiece) {
    // If this is the phantom of the soldier
    commands.push(new Transform(this, this.actualType, EliteSoldier.prototype));
    return commands;
  }

  if (this.row === this.promotionRank) {
    commands.push(new Transform(this, this.actualType, EliteSoldier.prototype));
    commands.push(
      new Transform(this.linkedPiece, this.linkedPiece.actualType, EnragedDog.prototype)
    );
  }

  if (dogIsTooFar(this.row, this.col, this.linkedPiece.row, this.linkedPiece.col)) {
    commands.push(
      new AfterMove(
        [this.linkedPiece.row, this.linkedPiece.col],
        getNewDogRC(startRow, startCol, this.row, this.col)
      )
    );
  }

  return commands;
};

Soldier.prototype.preciseTransform = function (piece) {
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

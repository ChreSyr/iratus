// CONSTRUCTOR

function King(board, color, row, col) {
  Piece.call(this, board, color, row, col);

  this.castleRights = "00"; // long castle right + short castle right
}

// INHERITANCE

King.prototype = Object.create(Piece.prototype);
King.prototype.constructor = King;

// STATIC VALUES

King.prototype.ID = "k";
King.prototype.MOVES = [
  [0, 1],
  [0, -1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [1, 1],
  [1, 0],
  [1, -1],
];

// INSTANCE METHODS - MECHANICS

King.prototype.canGoTo = function (row, col) {
  if ((this.posIsUnderCheck(row, col), (takePhantomsIntoAccount = false))) {
    return false;
  }
  let piece = this.board.get(row, col);
  if (piece === null) {
    return true;
  } else if (piece.ID === "y") {
    return false;
  } else {
    return piece.color !== this.color && !piece.dynamited;
  }
};

King.prototype.copyFrom = function (original) {
  Piece.prototype.copyFrom.call(this, original);
  this.firstMove = original.firstMove;
  this.castleRights = original.castleRights;
};

King.prototype.goTo = function (row, col) {
  let hasMoved = this.hasMoved();
  let commands = Piece.prototype.goTo.call(this, row, col);

  if (!hasMoved) {
    if (col === 2 && this.castleRights[0] === "1") {
      // Long castle
      commands.push(new AfterMove([row, col - 2], [row, col + 1]));
      commands.push(new Notation("0-0-0"));
    } else if (col === 6 && this.castleRights[1] === "1") {
      // Short castle
      commands.push(new AfterMove([row, col + 1], [row, col - 1]));
      commands.push(new Notation("0-0"));
    }
  }

  return commands;
};

King.prototype.getRookAt = function (side) {
  if (this.hasMoved()) {
    return;
  }

  let piece;
  if (side === "left") {
    piece = this.board.get(this.row, this.col - 4);
  } else {
    piece = this.board.get(this.row, this.col + 3);
  }

  if (!piece || piece.ID !== "r") {
    return;
  }

  return piece;
};

King.prototype.inCheck = function () {
  return this.posIsUnderCheck(this.row, this.col);
};

King.prototype.posIsUnderCheck = function (row, col, takePhantomsIntoAccount = true) {
  for (let piece of this.board.piecesColored[this.enemyColor]) {
    // the phantom's antiking squares can change after a capture
    // so they are taken in account only during calculation
    // and when checking for a mate
    if (takePhantomsIntoAccount === false) {
      if (piece.widget && piece.cssClass === "phantom") {
        continue;
      }
    }

    if (!piece.isCaptured) {
      for (let antiking of piece.antikingSquares) {
        if (row === antiking[0] && col === antiking[1]) {
          return true;
        }
      }
    }
  }
  return false;
};

King.prototype.updateValidMoves = function () {
  Piece.prototype.updateValidMoves.call(this);

  let canLongCastle = false;
  let canShortCastle = false;
  if (!this.hasMoved() && !this.inCheck()) {
    // long castle
    let leftRook = this.getRookAt("left");
    if (leftRook && !leftRook.hasMoved()) {
      canLongCastle = true;
      for (let dx of [-1, -2]) {
        if (this.board.get(this.row, this.col + dx) !== null) {
          canLongCastle = false;
          break;
        }
        if (this.posIsUnderCheck(this.row, this.col + dx)) {
          canLongCastle = false;
          break;
        }
      }
      if (this.board.get(this.row, this.col - 3) !== null) {
        canLongCastle = false;
      }
      if (canLongCastle) {
        this.validMoves.push([this.row, this.col - 2]);
      }
    }
    // short castle
    let rigthRook = this.getRookAt("right");
    if (rigthRook && !rigthRook.hasMoved()) {
      canShortCastle = true;
      for (let dx of [1, 2]) {
        if (
          this.board.get(this.row, this.col + dx) !== null ||
          this.posIsUnderCheck(this.row, this.col + dx)
        ) {
          canShortCastle = false;
          break;
        }
      }
      if (canShortCastle) {
        this.validMoves.push([this.row, this.col + 2]);
      }
    }
  }

  this.castleRights = (canLongCastle === true ? "1" : "0") + (canShortCastle === true ? "1" : "0");
};

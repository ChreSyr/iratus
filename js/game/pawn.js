// CONSTRUCTOR

function Pawn(board, color, row, col) {
  Piece.call(this, board, color, row, col);

  this.attackingMoves = undefined;
  this.promotionRank = undefined;

  Pawn.prototype.preciseTransform(this);
}

// INHERITANCE

Pawn.prototype = Object.create(Piece.prototype);
Pawn.prototype.constructor = Pawn;

// STATIC VALUES

Pawn.RELATIVE_VALUE = 1;

Pawn.prototype.ID = "p";
Pawn.prototype.ATTR_TO_COPY = Piece.prototype.ATTR_TO_COPY.concat([
  "attackingMoves",
  "promotionRank",
]);
Pawn.prototype.METH_TO_COPY = Piece.prototype.METH_TO_COPY.concat(["openPromotionWindow"]);

// NON-HERITABLE METHODS

Pawn.prototype.preciseTransform = function (piece) {
  if (piece.color === "b") {
    piece.MOVES = [
      [1, 0],
      [2, 0],
    ];
    piece.attackingMoves = [
      [1, 1],
      [1, -1],
    ];
    piece.promotionRank = 9;
  } else {
    piece.MOVES = [
      [-1, 0],
      [-2, 0],
    ];
    piece.attackingMoves = [
      [-1, 1],
      [-1, -1],
    ];
    piece.promotionRank = 0;
  }
};

// INSTANCE METHODS - MECHANICS

Pawn.prototype.goTo = function (row, col) {
  oldRow = this.row;
  let commands = Piece.prototype.goTo.call(this, row, col);

  // If moved two squares, can be en-passant-ed
  if (Math.abs(oldRow - this.row) === 2) {
    commands.push(
      new SetEnPassant(getCoordFromRowCol(this.row + (this.color === "w" ? 1 : -1), this.col))
    );
  }

  // Promotion
  if (this.row === this.promotionRank) {
    if (this.widget) {
      this.openPromotionWindow();
    }
  }

  // Capturing en passant
  const lastMove = this.board.game.movesHistory.slice(-1)[0];
  const enPassant = lastMove ? lastMove.enPassant : this.board.startFEN.enPassant;
  if (enPassant !== "-" && enPassant === this.getCoordinates()) {
    if (lastMove) {
      commands.push(new Capture(lastMove.piece, this));
    } else {
      const [epRow, epCol] = getRowColFromCoord(this.board.startFEN.enPassant);
      const captured = this.board.get(epRow + (this.color === "w" ? 1 : -1), epCol);
      if (!captured || captured.ID !== "p") {
        throw Error("Invalid FEN : en-passant doesn't match a pawn");
      }
      commands.push(new Capture(captured, this));
    }
  }

  return commands;
};

Pawn.prototype.redo = function (row, col) {
  Piece.prototype.goTo.call(this, row, col);
};

Pawn.prototype.updateValidMoves = function () {
  if (this.isCaptured) {
    return;
  }

  this.validMoves = [];
  this.antikingSquares = [];

  for (let move of this.MOVES) {
    let row = this.row + move[0];
    let col = this.col + move[1];

    if (row < 0 || row > 9 || col < 0 || col > 7) {
      continue;
    }

    if (this.board.get(row, col) === null) {
      this.validMoves.push([row, col]);
    } else {
      break;
    }
  }

  for (let move of this.attackingMoves) {
    let row = this.row + move[0];
    let col = this.col + move[1];

    if (row < 0 || row > 9 || col < 0 || col > 7) {
      continue;
    }

    this.antikingSquares.push([row, col]);

    let attackedPiece = this.board.get(row, col);
    if (attackedPiece === null) {
      // en passant
      const lastMove = this.board.game.movesHistory.slice(-1)[0];
      const enPassant = lastMove ? lastMove.enPassant : this.board.startFEN.enPassant;
      if (enPassant !== "-" && enPassant === getCoordFromRowCol(row, col)) {
        this.validMoves.push([row, col]);
      }
    } else if (this.canGoTo(row, col)) {
      this.validMoves.push([row, col]);
    }
  }
};

// INSTANCE METHODS - VIEW

Pawn.prototype.openPromotionWindow = function () {
  this.board.pawnToPromote = this;

  const promotionWrapper = document.querySelector(".promotion-wrapper");
  promotionWrapper.style.display = "block";

  const promotionWindow = document.querySelector(".promotion-window");
  if ((this.color === "w") ^ this.board.game.isFlipped()) {
    // ^ is the xor
    promotionWindow.classList.add("top");
  } else {
    promotionWindow.classList.remove("top");
  }
  if (this.board.game.isFlipped()) {
    promotionWindow.style.transform = `translateX(${(this.board.nbfiles - 1 - this.col) * 100}%)`;
  } else {
    promotionWindow.style.transform = `translateX(${this.col * 100}%)`;
  }

  let promotionPieces = document.getElementsByClassName("promotion-piece");
  for (let promotionPiece of promotionPieces) {
    promotionPiece.classList.add(this.color + promotionPiece.classList[1]);
  }
};


// CONSTRUCTOR

function PieceMovingTwice(type, board, row, col) {
  Piece.call(this, type, board, row, col);

  this.stillHasToMove = false;
}

// INHERITANCE

PieceMovingTwice.prototype = Object.create(Piece.prototype);
PieceMovingTwice.prototype.constructor = PieceMovingTwice;

// STATIC VALUES

PieceMovingTwice.prototype.RANGE = 10;
PieceMovingTwice.prototype.ATTR_TO_COPY = Piece.prototype.ATTR_TO_COPY.concat(["stillHasToMove"]);

// INSTANCE METHODS - MECHANICS

PieceMovingTwice.prototype.copyFrom = function (original) {
  Piece.prototype.copyFrom.call(this, original);
  if (! this.isCaptured) {
    this.stillHasToMove = original.stillHasToMove;
  }
}

PieceMovingTwice.prototype.goTo = function (row, col) {
  let commands = Piece.prototype.goTo.call(this, row, col);

  // required because of the grapple  // TODO : why ???
  if (this.cell) {
    let lastMove = this.board.game.movesHistory.slice(-1)[0];
    if (lastMove === undefined || (lastMove.piece === this && (lastMove.end[0] !== row || lastMove.end[1] !== col))) {
      this.stillHasToMove = false;
      return commands;
    }
  }

  // if captured, ignore second move
  for (let command of commands) {
    if (command.name === "capture" && command.args[0] === this) {
      this.stillHasToMove = false;
      return commands;
    }
  }
  if (this.isCaptured) {
    this.stillHasToMove = false;
    return commands;
  }

  if (this.board.mainCurrentMove.piece === this) {
    this.stillHasToMove = ! this.stillHasToMove;
    if (this.stillHasToMove) {
      commands.push(new SetNextTurn(this.color));
    }
  }

  return commands;
}

PieceMovingTwice.prototype.undo = function (move) {
  Piece.prototype.undo.call(this, move);

  if (this.board.game.movesHistory.length) {
    let lastMove = this.board.game.movesHistory.slice(-1)[0];
    this.stillHasToMove = lastMove.piece === this;
  }
}

PieceMovingTwice.prototype.updateValidMoves = function () {
  if (this.isCaptured) {return}

  this.validMoves = [];
  this.antikingSquares = [];

  for (let move of this.MOVES) {
    let row = this.row + move[0];
    let col = this.col + move[1];
    
    if (row < 0 || row > 9 || col < 0 || col > 7) {continue}
    
    this.antikingSquares.push([row, col]);
    if (this.canGoTo(row, col)) {
      this.validMoves.push([row, col]);

      for (let move2 of this.MOVES) {
        let row2 = row + move2[0];
        let col2 = col + move2[1];

        if (row2 < 0 || row2 > 9 || col2 < 0 || col2 > 7) {continue}  // out of board
        if (this.row === row2 && this.col === col2) {continue}  // can't protect itself
        if (this.antikingSquares.find(move => move[0] === row2 && move[1] === col2)) {continue}  // already in antikingSquares

        this.antikingSquares.push([row2, col2]);
      }
    }
  }
}
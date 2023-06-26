
// CONSTRUCTOR

function IratusBoard(game) {
  Board.call(this, game, nbranks=10, nbfiles=8);

  this.calculatorClass = CalculatorIratusBoard;
}

// INHERITANCE

IratusBoard.prototype = Object.create(Board.prototype);
IratusBoard.prototype.constructor = IratusBoard;

// INSTANCE METHODS

IratusBoard.prototype.addPiece = function (piece) {
  Board.prototype.addPiece.call(this, piece);
  if (piece instanceof Phantom) {
    if (this.phantom === undefined) {
      this.phantom = {};
    }
    this.phantom[piece.color] = piece;
  }
};

IratusBoard.prototype.createPieces = function () {
  Board.prototype.createPieces.call(this);
  let iratusBoard = [
  ["p", "d", "s","dy","dy", "s", "d", "g"],
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["i", "i", "i", "i", "i", "i", "i", "i"],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  ["i", "i", "i", "i", "i", "i", "i", "i"],
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "d", "s","dy","dy", "s", "d", "g"],
  ];
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 8; col++) {
      let pieceClass = pieceClassesByID[iratusBoard[row][col]];
      if (pieceClass !== null) {
        try {
          new pieceClass(this, row, col);
        } catch (error) {
          console.error(error);
        }
      }
    }
  }
};

IratusBoard.prototype.updateAllValidMoves = function () {
  Board.prototype.updateAllValidMoves.call(this);
  for (let piece of this.pieces) {
    piece.antikingSquares.length = 0;
  }
  for (let piece of this.pieces) {
    piece.updateValidMoves();
  }
  for (let king of Object.values(this.king)) {
    king.updateValidMoves();
  }
  this.calculator.clone();
  if (this.game.movesHistory.length === 0) {
    return;
  }
  
  let piece = this.game.movesHistory.slice(-1)[0].piece;
  
  if (piece.stillHasToMove) {
    let clonedPiece = this.calculator.getSimulatedPiece(piece);
    let validMoves = [];
    for (let validMove of piece.validMoves) {
      let moveObject = this.calculator.move(clonedPiece.getPos(), Piece.getPos(validMove), true);
      for (let enemyClonedPiece of this.calculator.piecesColored[clonedPiece.enemyColor]) {
        enemyClonedPiece.updateValidMoves();
      }
      if (!this.calculator.king[piece.color].inCheck()) {
        validMoves.push(validMove);
      }
      this.calculator.undo(moveObject);
    }
    piece.validMoves = validMoves;
    if (piece.validMoves.length === 0) {
      throw Error;
    }
    for (let otherPiece of this.piecesColored[piece.color]) {
      if (otherPiece === piece) {
        continue;
      }
      otherPiece.validMoves.length = 0;
    }
  } else {
    for (let piece of this.piecesColored[this.game.turn]) {
      let clonedPiece = this.calculator.getSimulatedPiece(piece);
      let validMoves = [];
      if (piece.stillHasToMove === false) {
        for (let validMove of piece.validMoves) {
          let moveObject = this.calculator.move(clonedPiece.getPos(), Piece.getPos(validMove), true);
          for (let enemyClonedPiece of this.calculator.piecesColored[clonedPiece.enemyColor]) {
            enemyClonedPiece.updateValidMoves();
          }
          let valid;
          if (moveObject.nextTurn === piece.color) {
            valid = false;
            clonedPiece.updateValidMoves();
            for (let validMove2 of clonedPiece.validMoves) {
              let moveObject2 = this.calculator.move(clonedPiece.getPos(), Piece.getPos(validMove2), true);
              for (let enemyClonedPiece2 of this.calculator.piecesColored[clonedPiece.enemyColor]) {
                enemyClonedPiece2.updateValidMoves();
              }
  
              if (!this.calculator.king[piece.color].inCheck()) {
                valid = true;
              }
              this.calculator.undo(moveObject2);
              if (valid) {
                break;
              }
            }
          } else {
            valid = !this.calculator.king[piece.color].inCheck();
          }
          this.calculator.undo(moveObject);
          if (valid) {
            validMoves.push(validMove);
          }
        }
      } else {
        for (let validMove of piece.validMoves) {
          let moveObject = this.calculator.move(clonedPiece.getPos(), Piece.getPos(validMove), true);
          for (let enemyClonedPiece of this.calculator.piecesColored[clonedPiece.enemyColor]) {
            enemyClonedPiece.updateValidMoves();
          }
          if (!this.calculator.king[piece.color].inCheck()) {
            validMoves.push(validMove);
          }
          this.calculator.undo(moveObject);
        }
      }
      piece.validMoves = validMoves;
    }
  }    
};
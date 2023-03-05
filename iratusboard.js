
class IratusBoard extends Board {

  static NBRANKS = 10;

  constructor(game) {

    super(game)

    this.calculatorClass = CalculatorIratusBoard;
  }

  createPieces() {
    
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
    let pieceClasses = {
      "k": King,
      "q": null,
      "r": Rook,
      "b": null,
      "n": Knight,
      "i": null,
      "dy": Dynamite,
      "s": null,
      "d": null,
      "p": null,
      "g": null,
      " ": null,
    }

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 8; col++) {
        let pieceClass = pieceClasses[iratusBoard[row][col]];
        if (pieceClass !== null) {
          new pieceClass(this, row, col);
        }
      }
    }
  }

  updateAllValidMoves() {

    for (let piece of this.pieces) {
      piece.antikingSquares.length = 0;
    }
    for (let piece of this.pieces) {
      piece.updateValidMoves();
    }
    this.calculator.clone();

    if (this.game.movesHistory.length === 0) {
      return;
    }
    
    let piece = this.game.movesHistory.slice(-1)[0].piece;
    
    if (piece instanceof PieceMovingTwice && piece.stillHasToMove) {
      let clonedPiece = this.calculator.getSimulatedPiece(piece);
      let validMoves = [];
      for (let validMove of piece.validMoves) {
        let moveObject = this.calculator.move(clonedPiece.getPos(), piece.getNextPos(validMove), true);
        for (let enemyClonedPiece of this.calculator.piecesColored[clonedPiece.enemyColor]) {
          enemyClonedPiece.updateValidMoves();
        }
        if (! this.calculator.king[piece.color].inCheck()) {
          validMoves.push(validMove);
        }
        this.calculator.undo(moveObject);
      }
      piece.validMoves = validMoves;
    } else {
      for (let piece of this.piecesColored[this.game.turn]) {
        let clonedPiece = this.calculator.getSimulatedPiece(piece);
        let validMoves = [];
        if (piece instanceof PieceMovingTwice && ! piece.stillHasToMove) {
          for (let validMove of piece.validMoves) {
            let moveObject = this.calculator.move(clonedPiece.getPos(), piece.getNextPos(validMove), true);
            for (let enemyClonedPiece of this.calculator.piecesColored[clonedPiece.enemyColor]) {
              enemyClonedPiece.updateValidMoves();
            }
            if (moveObject.nextTurn === piece.color) {
              let valid = false;
              clonedPiece.updateValidMoves();
              for (let validMove2 of clonedPiece.validMoves) {
                let moveObject2 = this.calculator.move(clonedPiece.getPos(), piece.getNextPos(validMove2), true);
                for (let enemyClonedPiece2 of this.calculator.piecesColored[clonedPiece.enemyColor]) {
                  enemyClonedPiece2.updateValidMoves();
                }

                if (! this.calculator.king[piece.color].inCheck()) {
                  valid = true;
                }
                this.calculator.undo(moveObject2);
                if (valid) {
                  break;
                }

              }
            } else {
              valid = ! this.calculator.king[piece.color].inCheck();
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
            if (! this.calculator.king[piece.color].inCheck()) {
              validMoves.push(validMove);
            }
            this.calculator.undo(moveObject);
          }
        }
        piece.validMoves = validMoves;
      }
    }
  }
}

class CalculatorIratusBoard extends IratusBoard {

  constructor(board) {
    super(board.game);

    this.realBoard = board;
    this.piecesCorrespondence = {};
    for (let i of board.pieces.keys()) {
      this.piecesCorrespondence[i] = this.pieces[i];
    }
  }

  clone() {
    this.piecesByPos.fill(null);
    for (let [i, piece] of this.realBoard.pieces.entries()) {
      this.piecesCorrespondence[i].copyFrom(piece);
    }
  }

  getSimulatedPiece(original) {
    let i = original.board.pieces.indexOf(original);
    return this.piecesCorrespondence[i];
  }
}
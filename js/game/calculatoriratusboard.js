
// CONSTRUCTOR

function CalculatorIratusBoard(board) {
  IratusBoard.call(this, board.game);
  
  this.realBoard = board;
  this.piecesCorrespondence = {};
  for (let i of board.pieces.keys()) {
    this.piecesCorrespondence[i] = this.pieces[i];
  }
}

// INHERITANCE

CalculatorIratusBoard.prototype = Object.create(IratusBoard.prototype);
CalculatorIratusBoard.prototype.constructor = CalculatorIratusBoard;

// INSTANCE METHODS

IratusBoard.prototype.clone = function() {
  this.piecesByPos.fill(null);
  for (let [i, piece] of this.realBoard.pieces.entries()) {
    this.piecesCorrespondence[i].copyFrom(piece);
  }
}

IratusBoard.prototype.getSimulatedPiece = function(original) {
  let i = original.board.pieces.indexOf(original);
  return this.piecesCorrespondence[i];
}

alert('CalculatorIratusBoard');

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
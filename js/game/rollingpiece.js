
class RollingPiece extends Piece {

  static RANGE = 10;

  static updateValidMoves() {

    if (this.isCaptured) {return}
    
    this.validMoves = [];
    this.antikingSquares = [];
    for (let i = 0; i < this.MOVES.length; i++) {
      let move = this.MOVES[i];
      let row = this.row + move[0];
      let col = this.col + move[1];
      
      for (let iRange = 0; iRange < this.RANGE; iRange++) {

        if (row < 0 || row > 9 || col < 0 || col > 7) {break}

        this.antikingSquares.push([row, col]);
        if (this.canGoTo(row, col)) {
          this.validMoves.push([row, col]);
          if (this.board.get(row, col) !== null) {
            break;
          }
          row += move[0];
          col += move[1];
        } else {
          break;
        }
      }
    }
  }
}
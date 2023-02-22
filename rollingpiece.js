class RollingPiece extends Piece {

  getAccessibleMoves() {
    let accessibleMoves = [];
    for (let i = 0; i < this.constructor.MOVES.length; i++) {
      let move = this.constructor.MOVES[i];
      let row = this.row + move[0];
      let col = this.col + move[1];
      while (row >= 0 && row <= 9 && col >= 0 && col <= 7) {
        accessibleMoves.push([row, col]);
        row += move[0];
        col += move[1];
      }
    }
    return accessibleMoves;
  }
}

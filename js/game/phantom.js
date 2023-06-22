
alert('Phantom');

class Phantom extends Piece {

  static ID = "p";

  constructor(board, row, col) {
    super(board, row, col);

    this.cssClass = "phantom";
  }
  
  static canGoTo(row, col) {

    let piece = this.board.get(row, col);
    if (piece === null) {
      return true;
    } else if (piece.ID === "dy") {
      return false;
    } else {
      return piece.color !== this.color;
    }
  }
}
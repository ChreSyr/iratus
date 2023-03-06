
class Phantom extends Piece {

  static ID = "p";
  
  canGoTo(row, col) {

    let piece = this.board.get(row, col);
    if (piece === null) {
      return true;
    } else if (piece.ID === "dy") {
      return false;
    } else {
      return piece.color !== this.color;
    }
  }
  
  transform(pieceClass) {

    if (this.actualClass === pieceClass) {return}

    super.transform(pieceClass);

    if (this.cell !== null) {
      this.cell.style.opacity = .7;
    }
  }

  // View methods

  initDisplay() {
    super.initDisplay();
    this.cell.style.opacity = .7;
  }

  justMoved() {
    if (this.cell !== null) {
      this.cell.style.opacity = .7;
    }
  }
}

class Grapple extends RollingPiece {
  static ID = "g";
  static MOVES = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  static canGoTo(row, col) {
    let piece = this.board.get(row, col);
    if (piece === null) {
      return true;
    } else if (piece.ID === "dy") {
      return false;
    } else {
      return true;
    }
  }

  static capturerCheck() {
    return false;
  }

  static goTo(row, col) {
    let grappledPiece = this.board.get(row, col);
    if (! grappledPiece) {return super.goTo(row, col)}
    const getCoord = (piece) => fileDict[piece.col] + (this.board.NBRANKS - piece.row);
    let commands = [];

    let notation = "G:";
    if (grappledPiece.ID !== "i") {
      notation += grappledPiece.ID.toUpperCase();
    }
    notation += getCoord(grappledPiece) + "->" + getCoord(this);  // ex : G:Nf6->d4
    commands.push(new Notation(notation));
    commands.push(new Capture(this, this));
    commands.push(new AfterMove([grappledPiece.row, grappledPiece.col], [this.row, this.col]));
    return commands;
  }

  static updateValidMoves() {
    super.updateValidMoves();
    this.antikingSquares.length = 0;
  }
}
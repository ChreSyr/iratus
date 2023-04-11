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

class Bishop extends RollingPiece {

  static ID = "b";
  static MOVES = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
}

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

  canGoTo(row, col) {
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

class Queen extends RollingPiece {

  static ID = "q";
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
}

class Rook extends RollingPiece {

  static ID = "r";
  static MOVES = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
}


class King extends Piece {

  static ID = "k";
  static MOVES = [
    [0, 1],
    [0, -1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [1, 1],
    [1, 0],
    [1, -1],
  ];

  // long castle right + short castle right
  castleRights = "00"
  
  canGoTo(row, col) {

    if (this.posIsUnderCheck(row, col)) {
      return false;
    }
    let piece = this.board.get(row, col);
    if (piece === null) {
      return true;
    } else if (piece.ID === "dy") {
      return false;
    } else {
      return piece.color !== this.color && ! piece.dynamited;
    }
  }

  copyFrom(original) {
    super.copyFrom(original);
    this.castleRights = original.castleRights;
  }

  static goTo(row, col) {

    let hasMoved = this.hasMoved();
    let commands = super.goTo(row, col);

    if (! hasMoved) {

      if (col === 2 && this.castleRights[0] === "1") {  // Long castle
        commands.push(new AfterMove([row, col - 2], [row, col + 1]));
        commands.push(new Notation("0-0-0"));
      }

      else if (col === 6 && this.castleRights[1] === "1") {  // Short castle
        commands.push(new AfterMove([row, col + 1], [row, col - 1]));
        commands.push(new Notation("0-0"));
      }
    }

    return commands;
  }
  
  inCheck() {
    return this.posIsUnderCheck(this.row, this.col);
  }

  posIsUnderCheck(row, col) {
    for (let piece of this.board.piecesColored[this.enemyColor]) {
      if (! piece.isCaptured) {
        for (let antiking of piece.antikingSquares) {
          if (row === antiking[0] && col === antiking[1]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  static updateValidMoves() {
    super.updateValidMoves();

    if (! this.hasMoved() && ! this.inCheck()) {
      // long castle
      let canLongCastle = false;
      let pieceAtLeftCorner = this.board.get(this.row, this.col - 4);
      if (pieceAtLeftCorner !== null && pieceAtLeftCorner.ID === "r" && ! pieceAtLeftCorner.hasMoved()) {
        canLongCastle = true;
        for (let dx of [-1, -2]) {
          if (this.board.get(this.row, this.col + dx) !== null) {
            canLongCastle = false;
            break;
          }
          if (this.posIsUnderCheck(this.row, this.col + dx)) {
            canLongCastle = false;
            break;
          }
        }
        if (this.board.get(this.row, this.col - 3) !== null) {
          canLongCastle = false;
        }
        if (canLongCastle) {
          this.validMoves.push([this.row, this.col - 2]);
        }
      }
      // short castle
      let canShortCastle = false;
      let pieceAtRightCorner = this.board.get(this.row, this.col + 3);
      if (pieceAtRightCorner !== null && pieceAtRightCorner.ID === "r" && ! pieceAtRightCorner.hasMoved()) {
        canShortCastle = true;
        for (let dx of [1, 2]) {
          if (this.board.get(this.row, this.col + dx) !== null || this.posIsUnderCheck(this.row, this.col + dx)) {
            canShortCastle = false;
            break;
          }
        }
        if (canShortCastle) {
          this.validMoves.push([this.row, this.col + 2]);
        }
      }

      this.castleRights = (canLongCastle === true ? "1" : "0") + (canShortCastle === true ? "1" : "0")
    }
  }
}

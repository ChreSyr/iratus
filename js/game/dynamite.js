
class Dynamite extends Piece {

  static ID = "dy";
  static UNDYNAMITABLES = ["k", "q", "r", "dy", "p", "g"];

  static capture(capturer) {
    let commands = super.capture(this, capturer);
    commands.splice(commands.indexOf(commands.find(commandToRem => commandToRem.name === "transform")));  // remove phantomisation
    if (capturer !== this) {  // when an ally goes to the dynamite
      commands.push(new SetDynamite(capturer));
    }
    return commands;
  }

  static capturerCheck() {
    return false;
  }

  static copyFrom(original) {
    this.isCaptured = original.isCaptured;
    if (this.isCaptured) {return}
    this.board.piecesByPos[original.getPos()] = this;
  }

  static goTo(row, col) {  // when the dynamite goes to an ally
    let commands = [];
    commands.push(new Capture(this, this));
    commands.push(new SetDynamite(this.board.get(row, col)));
    return commands;
  }

  static updateValidMoves() {
    
    if (this.isCaptured) {return}

    this.validMoves = [];
    // this.antiking_squares = [[this.row, this.col]];

    for (let piece of this.board.piecesColored[this.color]) {
      if (piece.isCaptured) {continue}
      if (piece.dynamited) {continue}
      if (Dynamite.UNDYNAMITABLES.includes(piece.ID)) {continue}
      if (piece.constructor.ID === "p") {continue}
      if (! piece.hasMoved()) {
        this.validMoves.push([piece.row, piece.col])
      }
    }
  }
}
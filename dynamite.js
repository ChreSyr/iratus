
class Dynamite extends Piece {

  static ID = "DY";
  static UNDYNAMITABLES = ["K", "Q", "DY", "P", "G"];

  static updateValidMoves() {
    
    if (this.is_captured) {return}

    this.validMoves = [];
    // this.antiking_squares = [[this.row, this.col]];

    for (let piece of this.board.piecesColored[this.color]) {
      console.log(piece.ID, Dynamite.UNDYNAMITABLES)
      if (piece.is_captured) {continue}
      if (Dynamite.UNDYNAMITABLES.includes(piece.ID)) {continue}
      if (! piece.hasMoved()) {
        this.validMoves.push([piece.row, piece.col])
      }
    }
    console.log(this.validMoves)
  }

}

// def update_valid_moves(self):

//     for piece in self.board.set[self.color]:
//         if piece.is_captured:
//             continue
//         if piece.LETTER in ("k", "dy", "p", "g"):
//             continue
//         if not piece.has_moved():
//             d = piece.square - self.square
//             self.valid_moves += (d,)

    // def capture(self, capturer):

    //     commands = MainPiece.capture(self, capturer)

    //     # remove phantomisation
    //     commands = tuple(command for command in commands if command[0] != "transform")

    //     if capturer is self:
    //         commands = tuple(command for command in commands if command[0] != "transform")

    //     else:
    //         equip = "set_dynamite", capturer
    //         commands += (equip,)

    //     return commands

    // def capturer_check(self, piece):

    //     return False

    // def go_to(self, square):

    //     ally = self.board[square]
    //     assert ally != 0 and ally.color == self.color

    //     autodestruction = "capture", self, self,
    //     equip = "set_dynamite", ally
    //     commands = autodestruction, equip
    //     return commands

    // def undo(self, move):

    //     self.go_to(move.start_square)

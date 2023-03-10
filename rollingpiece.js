class RollingPiece extends Piece {

  static updateValidMoves() {

    if (this.isCaptured) {return}
    
    this.validMoves = [];
    this.antikingSquares = [];
    for (let i = 0; i < this.MOVES.length; i++) {
      let move = this.MOVES[i];
      let row = this.row + move[0];
      let col = this.col + move[1];
      while (row >= 0 && row <= 9 && col >= 0 && col <= 7) {
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

/**from mainpiece import RollingMainPiece
from leash import dog_is_too_far, get_dog_square


class Grapple(RollingMainPiece):

    LETTER = "g"
    moves = ((-1, -1), (-1, 1), (1, 1), (1, -1), (1, 0), (0, 1), (-1, 0), (0, -1))

    METH_TO_COPY = RollingMainPiece.METH_TO_COPY + ("capturer_check",)

    def can_go_to(self, square, move):

        piece = self.board[square]

        if piece == 0:
            extrapiece = self.board.get_extrapiece_at(square)
            if extrapiece != 0:
                return self.can_equip(extrapiece) and extrapiece.can_equip(self)
            return True

        return piece.can_be_captured_by(self, move)

    def can_equip(self, extrapiece):

        return False

    def capturer_check(self, piece):

        return False

    def go_to(self, square):

        hooked_piece = self.board[square]
        if hooked_piece != 0:

            cancel_mainmove = "cancel_mainmove",
            commands = cancel_mainmove,
            if hooked_piece.LETTER == "l":
                for command in self.board.current_move.commands:
                    if command[0] == "transform" and command[1] == hooked_piece.dog:
                        self.board.current_move.remove_command(command)
                        break

            notation = "notation", "H-" + hooked_piece.LETTER.upper() + hooked_piece.coordinates + "-" + \
                       self.coordinates  # H-Nf6-d4
            if hooked_piece.LETTER == "pa":
                notation = "notation", "H-" + hooked_piece.coordinates + "-" + self.coordinates  # H-f6-d4
            autodestruction = "capture", self, self
            pull = "after_move", hooked_piece.square, self.square
            commands += notation, autodestruction, pull
            if hooked_piece.LETTER == "d":
                dog = hooked_piece
                dogowner = dog.owner
                if dog_is_too_far(self.square, dogowner.square):
                    dogowner_pull = "after_move", dogowner.square, get_dog_square(dog.square, self.square)
                    commands += dogowner_pull,
            return commands

        else:
            return RollingMainPiece.go_to(self, square)

    def update_valid_moves(self):

        RollingMainPiece.update_valid_moves(self)
        self.antiking_squares = ()
 */

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

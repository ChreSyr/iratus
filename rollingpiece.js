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


/**from mainpiece import RollingMainPiece
from leash import dog_is_too_far, get_dog_square


class Grapple(RollingMainPiece):

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

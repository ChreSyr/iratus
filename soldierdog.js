

class PieceMovingTwice extends Piece {

  static ATTR_TO_COPY = Piece.ATTR_TO_COPY.concat(["stillHasToMove"]);

  constructor(board, row, col) {
    super(board, row, col);

    this.stillHasToMove = false;
  }

  static copyFrom(original) {
    super.copyFrom(original);
    if (! this.isCaptured) {
      this.stillHasToMove = original.stillHasToMove;
    }
  }

  static goTo(row, col) {
    let commands = super.goTo(row, col);

    // required because of the grapple  // TODO : why ???
    if (this.cell) {
      let lastMove = this.board.game.movesHistory.slice(-1)[0];
      if (lastMove === undefined || (lastMove.piece === this && (lastMove.end[0] !== row || lastMove.end[1] !== col))) {
        this.stillHasToMove = false;
        return commands;
      }
    }

    // if captured, ignore second move
    for (let command of commands) {
      if (command.name === "capture" && command.args[0] === this) {
        this.stillHasToMove = false;
        return command
      }
    }

    if (this.board.mainCurrentMove.piece === this) {
      this.stillHasToMove = ! this.stillHasToMove;
      if (this.stillHasToMove) {
        commands.push(new SetNextTurn(this.color));
      }
    }

    return commands;
  }

  static updateValidMoves() {
    if (this.isCaptured) {return}

    this.validMoves = [];
    this.antikingSquares = [];

    for (let move of this.MOVES) {
      let row = this.row + move[0];
      let col = this.col + move[1];
      
      if (row < 0 || row > 9 || col < 0 || col > 7) {continue}
      
      this.antikingSquares.push([row, col]);
      if (this.canGoTo(row, col)) {
        this.validMoves.push([row, col]);

        for (let move2 of this.MOVES) {
          let row2 = row + move2[0];
          let col2 = col + move2[1];

          if (row2 < 0 || row2 > 9 || col2 < 0 || col2 > 7) {continue}
          if (row === row2 && col === col2) {continue}
          if (this.antikingSquares.find(move => move[0] === row2 && move[1] === col2)) {continue}

          this.antikingSquares.push([row2, col2]);
        }
      }
    }
  }
}

class Soldier extends Piece {
  static ID = "s";

  constructor(board, row, col) {
    super(board, row, col);

    this.dog = undefined;

    if (col < 4) {
      this.dog = board.get(row, col - 1);
      this.dog.soldier = this;
    }

    Soldier.preciseTransform(this);
  }

  static preciseTransform(piece) {

    if (! piece instanceof Soldier) {
      piece.dog = null;
    }

    if (piece.color === "b") {
      piece.MOVES = [[1, 1], [1, -1]];
      piece.promotionRank = 9;
    } else {
      piece.MOVES = [[-1, 1], [-1, -1]];
      piece.promotionRank = 0;
    }
  }

}

/*
    def capture(self, capturer):

        commands = HasMoved.capture(self, capturer)

        if self.malus is not None and self.malus.LETTER == "c":  # release, don't enrage the dog
            return commands

        if self.dog is None:
            return commands

        if not self.dog.is_captured:
            dog_enrage = "transform", self.dog, self.dog.actual_class, EnragedDog
            if commands is None:
                commands = dog_enrage,
            else:
                commands = commands + (dog_enrage,)

        else:
            commands = list(commands)
            for command in commands:
                if command[0] == "transform":  # phantomisation
                    commands.remove(command)
                    break

        return commands

    def go_to(self, square):

        start_square = self.square
        commands = HasMoved.go_to(self, square)

        # happens when this is a phantom soldier
        if self.dog is None:
            return commands

        if self.rank == self.promotion_rank:
            superhero = "transform", self, Soldier, SuperSoldier
            commands += (superhero,)

        if dog_is_too_far(self.square, self.dog.square):

            dog_pull = "after_move", self.dog.square, get_dog_square(start_square, self.square)
            commands = (dog_pull,) + commands

        return commands

    def update_valid_moves(self):

        HasMoved.update_valid_moves(self)

        if self.dog is not None:
            if self.dog.square in self.antiking_squares:
                self.antiking_squares = list(self.antiking_squares)
                self.antiking_squares.remove(self.dog.square)
                self.antiking_squares = tuple(self.antiking_squares)
*/

class SuperSoldier extends PieceMovingTwice {
  static ID = "ss";
  static MOVES = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
/* 
class SuperSoldier(MainPieceMovingTwice):

    LETTER = "ss"
    moves = ((-1, -1), (1, -1), (1, 1), (-1, 1))

    @staticmethod
    def precise_transform(piece):

        if not isinstance(piece, Soldier):
            piece.dog = None

    def capture(self, capturer):

        commands = MainPieceMovingTwice.capture(self, capturer)

        if self.malus is not None and self.malus.LETTER == "c":  # release, don't enrage the dog
            return commands

        if self.dog is None:
            return commands

        if not self.dog.is_captured:
            dog_enrage = "transform", self.dog, self.dog.actual_class, EnragedDog
            if commands is None:
                commands = dog_enrage,
            else:
                commands = commands + (dog_enrage,)

        else:
            commands = list(commands)
            for command in commands:
                if command[0] == "transform":  # phantomisation
                    commands.remove(command)
                    break

        return commands

    def go_to(self, square):

        start_square = self.square
        commands = MainPieceMovingTwice.go_to(self, square)

        # happens when this is a phantom leash
        if self.dog is None:
            return commands

        if dog_is_too_far(self.square, self.dog.square):

            dog_pull = "after_move", self.dog.square, get_dog_square(start_square, self.square)
            return (dog_pull,) + commands

        return commands

    def update_valid_moves(self):

        MainPieceMovingTwice.update_valid_moves(self)

        if self.dog is not None:
            if self.dog.square in self.antiking_squares:
                self.antiking_squares = list(self.antiking_squares)
                self.antiking_squares.remove(self.dog.square)
                self.antiking_squares = tuple(self.antiking_squares)
 */
}

class Dog extends Piece {
  static ID = "d";
/* 
class Dog(HasMoved):

    LETTER = "d"
    # moves = ((-1, 0), (-1, -1), (0, -1), (1, -1), (1, 0), (1, 1), (0, 1), (-1, 1))

    def __init__(self, board, color, square):

        HasMoved.__init__(self, board, color, square)

        self.owner = None

    def capture(self, capturer):

        commands = HasMoved.capture(self, capturer)
        if not self.owner.is_captured:
            capture = "capture", self.owner, capturer
            commands += capture,

            for command in commands:
                if command[0] == "transform":  # phantomisation
                    command[3] = EnragedDog
        return commands

    def set_malus(self, malus):

        HasMoved.set_malus(self, malus)

        if malus is not None and malus.LETTER == "c" and not self.owner.is_captured:
            owner_capture = "capture", self.owner, malus
            enragement = "transform", self, Dog, EnragedDog
            return owner_capture, enragement

    def update_valid_moves(self):

        if self.is_captured:
            return

        self.valid_moves = ()
        self.antiking_squares = ()

        x = self.owner.square // 10
        y = self.owner.square % 10
        from_dog_to_leash = self.owner.square - self.square

        for move in self.moves:

            dx, dy = move

            if not self.board.has_square(x + dx, y + dy):
                continue

            d = dx * 10 + dy
            square = self.owner.square + d
            if square == self.square:
                continue
            if square not in self.board.existing_squares:
                raise AssertionError
            if square != self.square:
                self.antiking_squares += (square,)

            start_square = self.square
            end_square = square
            dx = end_square // 10 - start_square // 10
            dy = end_square % 10 - start_square % 10

            if self.can_go_to(square, (dx, dy)):
                self.valid_moves += (from_dog_to_leash + d,)

        if self.bonus:
            self.bonus.update_ally_vm()
        if self.malus:
            self.malus.update_victim_vm()
 */
}

class EnragedDog extends PieceMovingTwice {
  static ID = "ed";
  static MOVES = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
}

function dogIsTooFar(leashRow, leashCol, dogRow, dogCol) {
  return Math.abs(leashRow - dogRow) > 1 || Math.abs(leashCol - dogCol) > 1;
}

function getNewDogRC(leashStartRow, leashStartCol, leashEndRow, leashEndCol) {
  let deltaRow = normed(leashEndRow - leashStartRow);
  let deltaCol = normed(leashEndCol - leashStartCol);
  return leashEndRow - deltaRow, leashEndCol - deltaCol;
}

function normed(x) {
  if (x < 0) {return -1} else if (x > 0) {return 1} else {0}
}
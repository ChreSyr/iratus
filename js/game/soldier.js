
class Soldier extends RollingPiece {
  static ID = "s";
  static RANGE = 2;

  constructor(board, row, col) {
    super(board, row, col);

    this.dog = undefined;

    if (col < 4) {
      this.dog = board.get(row, col - 1);
      this.dog.soldier = this;
    }

    Soldier.preciseTransform(this);
  }
  
  static canGoTo(row, col) {

    let piece = this.board.get(row, col);
    if (piece === null) {
      return true;
    } else if (piece.ID === "dy") {
      return piece.color === this.color && ! Dynamite.UNDYNAMITABLES.includes(this.ID);
    } else {
      return piece.color !== this.color && piece.ID === "i";  // only captures pawns
    }
  }

  static capture(capturer) {
    let commands = super.capture(capturer);

    if (! this.dog) {return commands}  // happens when this is the phantom

    if (! this.dog.isCaptured) {
      commands.push(new Transform(this.dog, this.dog.actualClass, EnragedDog));  // enrage dog
    } else {
      commands.splice(commands.indexOf(commands.find(commandToRem => commandToRem.name === "transform")));  // remove leash phantomisation, stays dog
    }

    return commands;
  }

  static goTo(row, col) {
    let startRow = this.row, startCol = this.col;
    let commands = super.goTo(row, col);

    if (! this.dog) {return commands}  // happens when this is the phantom

    if (this.row === this.promotionRank) {
      commands.push(new Transform(this, this.actualClass, EliteSoldier));
    }

    if (dogIsTooFar(this.row, this.col, this.dog.row, this.dog.col)) {
      commands.push(new AfterMove([this.dog.row, this.dog.col], getNewDogRC(startRow, startCol, this.row, this.col)));
    }

    return commands;
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

  static updateValidMoves() {
    super.updateValidMoves();

    this.antikingSquares = []
  }
}
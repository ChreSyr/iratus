
alert('EliteSoldier');

class EliteSoldier extends PieceMovingTwice {
  static ID = "es";
  static MOVES = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  constructor(board, row, col) {
    super(board, row, col);

    this.dog = null;
  }

  static preciseTransform(piece) {
    if (! piece instanceof EliteSoldier) {
      piece.dog = null;
    }
  }

  static capture(capturer) {
    let commands = super.capture(capturer);

    if (! this.dog) {return commands}  // happens when this is the phantom or a promoted pawn

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

    if (! this.dog) {return commands}  // happens when this is the phantom or a promoted pawn

    if (dogIsTooFar(this.row, this.col, this.dog.row, this.dog.col)) {
      commands.push(new AfterMove([this.dog.row, this.dog.col], getNewDogRC(startRow, startCol, this.row, this.col)));
    }

    return commands;
  }

  static updateValidMoves() {
    super.updateValidMoves();

    if (this.dog) {
      let squareToRemove = [this.dog.row, this.dog.col];
      this.antikingSquares = this.antikingSquares.filter(arr => JSON.stringify(arr) !== JSON.stringify(squareToRemove));
    }
  }
}
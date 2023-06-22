
class Dog extends Piece {
  static ID = "d";

  constructor(board, row, col) {
    super(board, row, col);

    this.soldier = undefined;

    if (col > 3) {
      this.soldier = board.get(row, col - 1);
      this.soldier.dog = this;
    }
  }

  static capture(capturer) {
    let commands = super.capture(capturer);

    if (! this.soldier.isCaptured) {
      for (let command of commands) {
        if (command.name === "transform") {
          command.args[2] = EnragedDog  // a captured dog creates an enrageddog's phantom
        }
      }
      commands.push(new Capture(this.soldier, capturer));
    }

    return commands;
  }

  static goTo(row, col) {
    let startRow = this.row, startCol = this.col;
    let commands = super.goTo(row, col);

    if (dogIsTooFar(this.soldier.row, this.soldier.col, this.row, this.col)) {  // happens when pulled by the grapple
      commands.push(new AfterMove([this.soldier.row, this.soldier.col], getNewDogRC(startRow, startCol, this.row, this.col)));
    }
    return commands;
  }
}


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
        return commands;
      }
    }
    if (this.isCaptured) {
      this.stillHasToMove = false;
      return commands;
    }

    if (this.board.mainCurrentMove.piece === this) {
      this.stillHasToMove = ! this.stillHasToMove;
      if (this.stillHasToMove) {
        commands.push(new SetNextTurn(this.color));
      }
    }

    return commands;
  }

  static undo(move) {
    super.undo(move);

    if (this.board.game.movesHistory.length) {
      let lastMove = this.board.game.movesHistory.slice(-1)[0];
      this.stillHasToMove = lastMove.piece === this;
    }
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
      commands.push(new Transform(this, this.actualClass, SuperSoldier));
    }

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

class SuperSoldier extends PieceMovingTwice {
  static ID = "ss";
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
    if (! piece instanceof SuperSoldier) {
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
          command.args[2] = EnragedDog  // a captured Dog creates an EnragedDog's phantom
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
  return [leashEndRow - deltaRow, leashEndCol - deltaCol];
}

function normed(x) {
  if (x < 0) {return -1} else if (x > 0) {return 1} else {return 0}
}
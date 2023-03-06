
class Command {
  constructor(name, ...args) {
    this.name = name;
    this.args = args;
  }
}

class AfterMove extends Command {
  constructor(start, end) {
    super("afterMove", start, end);
  }
}

class Capture extends Command {
  constructor(captured, capturer) {
    super("capture", captured, capturer)
  }
}

class MainMove extends Command {
  constructor() {
    super("mainMove");
  }
}

class Notation extends Command {
  constructor(notation) {
    super("notation", notation);
  }
}

class NotationHint extends Command {
  constructor(hint) {
    super("notationHint", hint);
  }
}

class SetDynamite extends Command {
  constructor(piece) {
    super("setDynamite", piece);
  }
}

class Transform extends Command {
  constructor(piece, oldClass, newClass) {
    super("transform", piece, oldClass, newClass);
  }
}

class Move {
  constructor(board, start, end) {
    this.board = board;
    this.start = start;
    this.end = end;

    this.piece = board.get(start[0], start[1]);
    this.commands = [];
    this.captures = 0;
    this.notation = undefined;
    this.notationHints = [];
    this.turn = this.piece.color;
    this.nextTurn = this.piece.enemyColor;
    this.turnNumber = 1;
    this.counter50rule = 0;

    if (board.game.movesHistory.length) {
      let lastMove = this.board.game.movesHistory.slice(-1)[0];
      this.turnNumber = lastMove.turnNumber;
      if (lastMove.turn !== this.turn) {
        this.turnNumber += .5;
        this.counter50rule = lastMove.counter50rule + .5;
      }
    }

    let captured = board.get(end[0], end[1]);
    if (captured !== null && this.piece.capturerCheck()) {
      this.executeCommand(new Capture(captured, this.piece))
    }

    if (this.piece.ID == "i") {
      this.counter50rule = 0;
    }

    this.counter50rule_backup = this.counter50rule;
  }

  executeCommands(commands) {
    for (let command of commands) {
      this.executeCommand(command);
    }
  }

  executeCommand(command) {
    let args = command.args;
    switch (command.name) {
      case "afterMove":
      case "beforeMove":
        let extraMove = this.board.move(args[0], args[1], false);
        extraMove.turnNumber = this.turnNumber;
        this.commands.push(new Command(command.name, extraMove));
        break;
      case "anticapture":
        let commandToRem = undefined;
        for (let previousCommand of this.commands) {
          if (previousCommand.name === "capture" && previousCommand.args[0] === args[0]) {
            commandToRem = previousCommand;
            break;
          }
        }
        this.commands.splice(this.commands.indexOf(commandToRem));
        commandToRem.args[0].uncapture();
        this.captures -= 1;
        if (this.captures === 0) {
          this.counter50rule = this.counter50rule_backup;
        }
        break;
      case "cancelMainMove":
        commandToRem = undefined;
        for (let previousCommand of this.commands) {
          if (previousCommand.name === "mainMove") {
            commandToRem = previousCommand;
            break;
          }
        }
        this.commands.splice(this.commands.indexOf(commandToRem));
        break;
      case "capture":
        this.captures += 1;
        this.counter50rule = 0;
        this.commands.push(command);
        this.executeCommands(args[0].capture(args[1]));
        break;
      case "mainMove":
        this.commands.push(command);
        this.executeCommands(this.piece.goTo(this.end[0], this.end[1]));
        this.initNotation();
        break;
      case "notation":
        this.notation = args[0];
        break;
      case "notationHint":
        this.notationHints.push(args[0]);
        break;
      case "setDynamite":
        this.commands.push(command);
        args[0].setDynamite(true);
        break;
      case "setNextTurn":
        this.nextTurn = args[0];
        break;
      case "transform":
        this.commands.push(command);
        args[0].transform(args[2]);
        break;
      default:
        throw Error;
    }
  }

  initNotation() {
    if (this.notation !== undefined) {return}

    let notation = "";
    let piece = this.piece;

    // piece name
    if (piece.ID !== "i") {
      notation += piece.ID.toUpperCase();
    }

    // start square precision
    if (["n", "b", "r", "q", "s", "d", "ed"].includes(piece.ID)) {
      let sameClassAllies = [];
      for (let ally of this.board.piecesColored[piece.color]) {
        if (ally.ID === piece.ID && ally !== piece) {
          sameClassAllies.push(ally);
        }
      }
      if (sameClassAllies.length) {
        let annoyingAllies = [];
        for (let ally of sameClassAllies) {
          for (let validMove of ally.validMoves) {
            if (this.end[0] === ally.row + validMove[0] && this.end[1] === ally.col + validMove[1]) {
              annoyingAllies.push(ally);
            }
          }
        }
        let annoyingAlliesLength = annoyingAllies.length;
        if (annoyingAlliesLength === 1) {
          if (this.start[1] === annoyingAllies[0].col) {  // They are on the same file, so we indiquate the rank
            notation += this.board.NBRANKS - this.start[0];
          } else {  // They are not on the same file, so we indiquate the file
            notation += fileDict[this.start[1]];
          }
        } else if (annoyingAlliesLength > 1) {
          let sameFile = false;
          let sameRank = false;
          for (let ally of annoyingAllies) {
            if (ally.col === this.start[1]) {
              sameFile = true;
            }
            if (ally.row === this.start[0]) {
              sameRank = true;
            }
          }
          if (sameFile === false) {  // They are on the same file, so we indiquate the file
            notation += fileDict[this.start[1]];
          } else if (sameRank === false) {  // They are on the same file, but not on the same rank, so we indiquate the rank
            notation += this.board.NBRANKS - this.start[0];
          } else {  // There is at least one ally on the same rank and one ally on the same file
            notation += fileDict[this.start[1]] + (this.board.NBRANKS - this.start[0]);
          }
        }
      }
    }

    // captures
    if (this.captures > 0) {
      if (piece.ID === "i") {  // When a pawn captures something, we write its origin file
        notation += fileDict[this.start[1]];
      }
      if (piece.ID === "dy") {
        notation += "+" + this.board.get(this.end[0], this.end[1]).ID.toUpperCase();
      } else {
        notation += "x";
      }
    }

    // coordinates
    notation += fileDict[this.end[1]] + (this.board.NBRANKS - this.end[0]);

    // hints
    for (let hint of this.notationHints) {
      notation += hint;
    }

    this.notation = notation;
  }

  redoCommands() {
    for (let command of this.commands) {
      switch (command.name) {
        case "afterMove":
        case "beforeMove":
          this.board.redo(command.args[0], false);
          break;
        case "capture":
          command.args[0].capture(command.args[1]);
          break;
        case "mainMove":
          this.piece.redo(this.end[0], this.end[1]);
          break;
        case "setDynamite":
          command.args[0].setDynamite(true);
          break;
        case "transform":
          command.args[0].transform(command.args[2]);
          break;
      }
    }
  }

  removeCommand(commandToRem) {
    this.commands.splice(this.commands.indexOf(commandToRem));
    this.undoCommand(commandToRem);
  }

  undoCommand(command) {
    switch (command.name) {
      case "afterMove":
      case "beforeMove":
        this.board.undo(command.args[0]);
        break;
      case "capture":
        command.args[0].uncapture();
        break;
      case "mainMove":
        this.piece.undo(this);
        break;
      case "setDynamite":
        command.args[0].setDynamite(false);
        break;
      case "transform":
        command.args[0].transform(command.args[1]);
        break;
    }
  }
}

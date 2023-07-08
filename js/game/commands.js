function Command(name, ...args) {
  return {
    name,
    args,
  };
}

function AfterMove(start, end) {
  return Command("afterMove", start, end);
}

function Capture(captured, capturer) {
  return Command("capture", captured, capturer);
}

function MainMove() {
  return Command("mainMove");
}

function Notation(notation) {
  return Command("notation", notation);
}

function NotationHint(hint) {
  return Command("notationHint", hint);
}

function SetDynamite(piece) {
  return Command("setDynamite", piece);
}

function SetNextTurn(nextTurn) {
  return Command("setNextTurn", nextTurn);
}

function Transform(piece, oldClass, newClass) {
  return Command("transform", piece, oldClass, newClass);
}

function Move(board, start, end) {
  const piece = board.get(start[0], start[1]);
  const move = {
    board: board,
    start: start,
    end: end,

    piece: piece,
    commands: [],
    captures: 0,
    notation: undefined,
    notationHints: [],
    turn: piece.color,
    nextTurn: piece.enemyColor,
    turnNumber: 1,
    counter50rule: 0,

    capturedPieces: { w: [], b: [] }, // just for display

    executeCommands(commands) {
      for (let command of commands) {
        this.executeCommand(command);
      }
    },

    executeCommand(command) {
      const args = command.args;
      switch (command.name) {
        case "afterMove":
        case "beforeMove":
          const extraMove = this.board.move(args[0], args[1], false);
          extraMove.turnNumber = this.turnNumber;
          this.commands.push({ name: command.name, args: [extraMove] });
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
          this.initCapturedPieces();
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
    },

    initNotation() {
      if (this.notation !== undefined) {
        return;
      }

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
              if (
                this.end[0] === ally.row + validMove[0] &&
                this.end[1] === ally.col + validMove[1]
              ) {
                annoyingAllies.push(ally);
              }
            }
          }
          let annoyingAlliesLength = annoyingAllies.length;
          if (annoyingAlliesLength === 1) {
            if (this.start[1] === annoyingAllies[0].col) {
              notation += this.board.nbranks - this.start[0];
            } else {
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
            if (sameFile === false) {
              notation += fileDict[this.start[1]];
            } else if (sameRank === false) {
              notation += this.board.nbranks - this.start[0];
            } else {
              notation += fileDict[this.start[1]] + (this.board.nbranks - this.start[0]);
            }
          }
        }
      }

      // captures
      if (this.captures > 0) {
        if (piece.ID === "i") {
          notation += fileDict[this.start[1]];
        }
        if (piece.ID === "dy") {
          notation += "+" + this.board.get(this.end[0], this.end[1]).ID.toUpperCase();
        } else {
          notation += "x";
        }
      }

      // coordinates
      notation += fileDict[this.end[1]] + (this.board.nbranks - this.end[0]);

      // hints
      for (let hint of this.notationHints) {
        notation += hint;
      }

      this.notation = notation;
    },

    initCapturedPieces() {
      // Captured pieces display
      if (board.calculator) {
        for (let command of this.commands) {
          if (command.name === "capture") {
            let capturedPiece = command.args[0];
            if (capturedPiece.ID === "dy") {
              continue;
            } // dynamite equipement
            this.capturedPieces[capturedPiece.color].push(capturedPiece.__proto__.ID);
            if (capturedPiece.dynamited) {
              this.capturedPieces[capturedPiece.color].push("dy");
            }
          }
        }
        console.log(this.capturedPieces);
      }
    },

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
    },

    removeCommand(commandToRem) {
      this.commands.splice(this.commands.indexOf(commandToRem));
      this.undoCommand(commandToRem);
    },

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
    },
  };

  move.turnNumber = board.game.movesHistory.length
    ? board.game.movesHistory.slice(-1)[0].turnNumber
    : 1;
  if (board.game.movesHistory.length) {
    let lastMove = board.game.movesHistory.slice(-1)[0];
    move.turnNumber = lastMove.turnNumber;
    if (lastMove.turn !== move.turn) {
      move.turnNumber += 0.5;
      move.counter50rule = lastMove.counter50rule + 1;
    } else if (lastMove.piece === piece) {
      // Piece moving twice
      move.counter50rule = lastMove.counter50rule;
    }
  } else {
    move.counter50rule = 1;
  }

  let captured = board.get(move.end[0], move.end[1]);
  if (captured !== null && move.piece.capturerCheck()) {
    move.executeCommand(Capture(captured, move.piece));
  }

  if (move.piece.ID == "i") {
    move.counter50rule = 0;
  }

  move.counter50rule_backup = move.counter50rule;

  return move;
}

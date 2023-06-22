
let pieceClasses = {
  "k": King,
  "q": Queen,
  "r": Rook,
  "b": Bishop,
  "n": Knight,
  "i": Pawn,
  "dy": Dynamite,
  "s": Soldier,
  "es": EliteSoldier,
  "d": Dog,
  "ed": EnragedDog,
  "p": Phantom,
  "g": Grapple,
  " ": null,
}

class Board {

  static NBRANKS = 8;
  static NBFILES = 8;

  constructor(game) {

    this.game = game;
    this.NBFILES = this.constructor.NBFILES;
    this.NBRANKS = this.constructor.NBRANKS;

    this.piecesByPos = new Array(this.NBFILES * this.NBRANKS).fill(null);
    this.pieces = [];
    this.piecesColored = {"w": [], "b": []};
    this.king = {};
    this.pawnToPromote = null;

    this.calculator = null;
    this.calculatorClass = null;
    this.fatPositionClass = null;
    this.createPieces();

    this.widget = null;
    this.selectedPiece = null;
    this.squareSelected = null;
    this.squaresAccessible = [];

    this.currentMove = null;
    this.mainCurrentMove = null;
  }

  addPiece(piece) {
    this.pieces.push(piece);
    this.piecesByPos[piece.getPos()] = piece;
    this.piecesColored[piece.color].push(piece);

    if (piece.ID === "k") {
      this.king[piece.color] = piece;
    }
  }

  createPieces() {}

  get(row, col) {
    return this.piecesByPos[col * 10 + row];
  }

  getFatPosition() {  // for the fatHistory
    return new FatPosition(this, this.game.turn);
  }
  
  initDisplay() {
    this.calculator = new this.calculatorClass(this);

    this.widget = document.getElementById("board-single");
    
    for (let piece of this.pieces) {
      piece.isWidgeted = true;
      piece.createWidget();
    }
  }
  
  move(start, end, main=true) {
    if (typeof start === "number") {
      start = [start % 10, Math.floor(start / 10)];
    }
    if (typeof end === "number") {
      end = [end % 10, Math.floor(end / 10)];
    }

    let currentMove = new Move(this, start, end);
    this.currentMove = currentMove;
    if (main) {
      this.mainCurrentMove = this.currentMove;
    }
    this.currentMove.executeCommand(new MainMove());

    return currentMove;  // need to return currentMove, not this.currentMove
  }

  redo(move, main=true) {
    this.currentMove = move;
    if (main) {
      this.mainCurrentMove = this.currentMove;
    }
    move.redoCommands();
  }

  undo(move) {
    for (let command of [...move.commands].reverse()) {
      move.undoCommand(command)
    }
  }
  
  updateAllValidMoves() {}
}

class FatPosition {
  // Stores a full chess position
  _EQ_ATTRIBUTES = ["castleRights", "turn"];

  constructor(board, turn) {
    this.piecesByPos = [
      null, null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null, null, null,
    ];

    for (let piece of board.pieces) {
      if (! piece.isCaptured) {
        this.piecesByPos[piece.getPos()] = piece.ID;
      }
    }

    this.casteRights = board.king["w"].castleRights + board.king["b"].castleRights;
    this.turn = turn;
  }
  
  equals(other) {
    // NOTE : according to FIDE rules, I should check if en passant abilities are the same

    for (let attr of this._EQ_ATTRIBUTES) {
      if (this[attr] !== other[attr]) {
        return false;
      }
    }

    function arraysEqual(a, b) {
      if (a === b) return true;
      if (a == null || b == null) return false;
      if (a.length !== b.length) return false;
      for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }

    return arraysEqual(this.piecesByPos, other.piecesByPos);
  }
}

class IratusBoard extends Board {

  static NBRANKS = 10;

  constructor(game) {

    super(game)

    this.calculatorClass = CalculatorIratusBoard;
  }

  addPiece(piece) {
    super.addPiece(piece);

    if (piece instanceof Phantom) {
      if (this.phantom === undefined) {
        this.phantom = {};
      }
      this.phantom[piece.color] = piece;
    }
  }

  createPieces() {
    
    let iratusBoard = [
      ["p", "d", "s","dy","dy", "s", "d", "g"],
      ["r", "n", "b", "q", "k", "b", "n", "r"],
      ["i", "i", "i", "i", "i", "i", "i", "i"],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      ["i", "i", "i", "i", "i", "i", "i", "i"],
      ["r", "n", "b", "q", "k", "b", "n", "r"],
      ["p", "d", "s","dy","dy", "s", "d", "g"],
    ];
    // iratusBoard = [
    //   ["p", "d", "s","dy","dy", "n", "n", "g"],
    //   ["r", "n", "b", "r", "k", " ", "n", "n"],
    //   ["i", "i", "i", "r", "r", " ", "i", "i"],
    //   [" ", " ", " ", " ", " ", " ", " ", " "],
    //   [" ", " ", " ", " ", " ", " ", " ", " "],
    //   [" ", " ", " ", " ", " ", " ", " ", " "],
    //   [" ", " ", " ", " ", " ", " ", " ", " "],
    //   ["i", "i", "i", "i", "n", "r", "i", "i"],
    //   ["r", "n", "b", "q", "k", "r", "n", "r"],
    //   ["p", "d", "s","dy","dy", "r", "d", "g"],
    // ];
    // iratusBoard = [
    //   ["p", " ", " ", " ", " ", " ", " ", " "],
    //   [" ", " ", " ", " ", "k", " ", " ", " "],
    //   [" ", " ", " ", " ", " ", " ", " ", " "],
    //   [" ", " ", " ", " ", " ", " ", " ", " "],
    //   [" ", " ", " ", " ", " ", " ", "i", " "],
    //   [" ", " ", " ", " ", " ", " ", " ", "i"],
    //   [" ", " ", " ", " ", " ", " ", " ", " "],
    //   [" ", " ", " ", " ", " ", " ", " ", " "],
    //   [" ", " ", " ", " ", "k", " ", " ", " "],
    //   ["p", " ", " ", " ", " ", " ", " ", " "],
    // ];
    // iratusBoard = [
    //   [" ", " ", " ", " ","dy", " ", " ", " "],
    //   [" ", " ", " ", " ", "k", " ", " ", " "],
    //   [" ", " ", " ", " ","dy", " ", " ", " "],
    //   [" ", " ", " ", " ", " ", " ", " ", " "],
    //   [" ", " ", " ", " ", " ", " ", " ", " "],
    //   [" ", " ", " ", " ", " ", " ", " ", " "],
    //   [" ", " ", " ", " ", " ", " ", " ", " "],
    //   [" ", " ", " ", " ", " ", " ", " ", " "],
    //   [" ", " ", " ", "r", "k", "r", "n", " "],
    //   [" ", " ", " ", " ", " ", " ", " ", " "],
    // ];

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 8; col++) {
        let pieceClass = pieceClasses[iratusBoard[row][col]];
        if (pieceClass !== null) {
          new pieceClass(this, row, col);
        }
      }
    }
  }

  updateAllValidMoves() {

    for (let piece of this.pieces) {
      piece.antikingSquares.length = 0;
    }
    for (let piece of this.pieces) {
      piece.updateValidMoves();
    }
    for (let king of Object.values(this.king)) {
      king.updateValidMoves();
    }
    this.calculator.clone();

    if (this.game.movesHistory.length === 0) {
      return;
    }
    
    let piece = this.game.movesHistory.slice(-1)[0].piece;
    
    if (piece.stillHasToMove) {
      let clonedPiece = this.calculator.getSimulatedPiece(piece);
      let validMoves = [];
      for (let validMove of piece.validMoves) {
        let moveObject = this.calculator.move(clonedPiece.getPos(), Piece.getPos(validMove), true);
        for (let enemyClonedPiece of this.calculator.piecesColored[clonedPiece.enemyColor]) {
          enemyClonedPiece.updateValidMoves();
        }
        if (! this.calculator.king[piece.color].inCheck()) {
          validMoves.push(validMove);
        }
        this.calculator.undo(moveObject);
      }
      piece.validMoves = validMoves;
      if (piece.validMoves.length === 0) {throw Error}
      for (let otherPiece of this.piecesColored[piece.color]) {
        if (otherPiece === piece) {continue}
        otherPiece.validMoves.length = 0;
      }
    } else {
      for (let piece of this.piecesColored[this.game.turn]) {
        let clonedPiece = this.calculator.getSimulatedPiece(piece);
        let validMoves = [];
        if (piece.stillHasToMove === false) {
          for (let validMove of piece.validMoves) {
            let moveObject = this.calculator.move(clonedPiece.getPos(), Piece.getPos(validMove), true);
            for (let enemyClonedPiece of this.calculator.piecesColored[clonedPiece.enemyColor]) {
              enemyClonedPiece.updateValidMoves();
            }
            let valid;
            if (moveObject.nextTurn === piece.color) {
              valid = false;
              clonedPiece.updateValidMoves();
              for (let validMove2 of clonedPiece.validMoves) {
                let moveObject2 = this.calculator.move(clonedPiece.getPos(), Piece.getPos(validMove2), true);
                for (let enemyClonedPiece2 of this.calculator.piecesColored[clonedPiece.enemyColor]) {
                  enemyClonedPiece2.updateValidMoves();
                }

                if (! this.calculator.king[piece.color].inCheck()) {
                  valid = true;
                }
                this.calculator.undo(moveObject2);
                if (valid) {
                  break;
                }

              }
            } else {
              valid = ! this.calculator.king[piece.color].inCheck();
            }
            this.calculator.undo(moveObject);
            if (valid) {
              validMoves.push(validMove);
            }
          }
        } else {
          for (let validMove of piece.validMoves) {
            let moveObject = this.calculator.move(clonedPiece.getPos(), Piece.getPos(validMove), true);
            for (let enemyClonedPiece of this.calculator.piecesColored[clonedPiece.enemyColor]) {
              enemyClonedPiece.updateValidMoves();
            }
            if (! this.calculator.king[piece.color].inCheck()) {
              validMoves.push(validMove);
            }
            this.calculator.undo(moveObject);
          }
        }
        piece.validMoves = validMoves;
      }
    }
  }
}

class CalculatorIratusBoard extends IratusBoard {

  constructor(board) {
    super(board.game);

    this.realBoard = board;
    this.piecesCorrespondence = {};
    for (let i of board.pieces.keys()) {
      this.piecesCorrespondence[i] = this.pieces[i];
    }
  }

  clone() {
    this.piecesByPos.fill(null);
    for (let [i, piece] of this.realBoard.pieces.entries()) {
      this.piecesCorrespondence[i].copyFrom(piece);
    }
  }

  getSimulatedPiece(original) {
    let i = original.board.pieces.indexOf(original);
    return this.piecesCorrespondence[i];
  }
}
// CONSTRUCTOR

function IratusBoard(game) {
  this.emptyFEN =
    "hd(0)s(0)yys(1)d(1)g/rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR/HD(2)S(2)YYS(3)D(3)G w QKqk - - 0000000000000000-0000000000000000 0 1";

  Board.call(this, game, (nbranks = 10), (nbfiles = 8));

  this.calculatorClass = CalculatorIratusBoard;
}

// INHERITANCE

IratusBoard.prototype = Object.create(Board.prototype);
IratusBoard.prototype.constructor = IratusBoard;

// INSTANCE METHODS

IratusBoard.prototype.addPiece = function (piece) {
  Board.prototype.addPiece.call(this, piece);
  if (piece instanceof Phantom) {
    if (this.phantom === undefined) {
      this.phantom = { w: [], b: [] };
    }
    this.phantom[piece.color].push(piece);
  }
};

IratusBoard.prototype.createPieces = function (fen = undefined) {
  // TESTS
  // All the pieces are at the same position
  // Turn is applied, even when a piece moving twice has to move again
  // Phantoms are correctly transformed
  // It is possible to have 0, 1 or more phantoms
  // Dynamited pieces are correctly dynamited
  // Linked pieces are correctly linked
  // Castle rights are correctly applied
  // Dynamitables.hasMoved() are kept the same
  // Counter50rule is used
  // TurnNumber is used

  fen = fen ? fen : this.emptyFEN;
  // let fen =
  //   "s~bkyos(0)d(0)g/6n_r/pp4bp/2p2Rp1/5r2/4P3/5BP1/PPPBN3/2KRN3/P~D(1)S(1)Y1S(2)D(2)1 b - - - 11100011100000-011000001011 100 67";
  // let fen =
  //   "b~d(0)s(0)yn_s(1)d(1)g/r3k2r/1ppqpp1p/3pPb2/3P3R/pP6/2N3P1/P1Q1pPB1/R3K3/P~2O_YS(2)D(2)G w Qq a5 - 001000000000-000000000000010 0 2";
  // let fen =
  //   "1d(0)s(0)1yE1g/1o~3b2/p1k5/Pp1n4/5p2/7p/5R1P/2P3P1/3R3K/B~6G b - a5 - 111000-001101111 0 45";
  // let fen = "3Q2b~1/8/p3kE2/1p6/5p2/7p/2P4P/6P1/7K/8 w - - - 1110-10111 0 57";

  // fen =
  //   "p~d(0)s(0)2s(1)d(1)g/2kr3r/1bn_p1n_b1/2p2q2/1p6/p3PB1p/P1N2N1P/BPPQ1PP1/O~2R1RK1/1D(2)S(2)YY2G w - - a1 11111110000100-00000110111111 6 21";

  const [
    pieces,
    turn,
    castleRights,
    enPassant,
    pieceMovingAgain,
    dynamitablesHasMoved,
    counter50rule,
    turnNumber,
  ] = fen.split(" ");
  this.startFEN = {
    pieces,
    turn,
    castleRights,
    enPassant,
    pieceMovingAgain,
    dynamitablesHasMoved,
    counter50rule,
    turnNumber,
  };
  const splittedDynamitablesHasMoved = dynamitablesHasMoved.split("-");
  this.startFEN.dynamitablesHasMoved = {
    w: splittedDynamitablesHasMoved[0],
    b: splittedDynamitablesHasMoved[1],
  };
  this.startFEN.counter50rule = parseInt(this.startFEN.counter50rule);
  this.startFEN.turnNumber = parseInt(this.startFEN.turnNumber);

  // PIECES
  let lastPiece = {};
  if (!Object.values(fenIDbyPieceID).includes(fen[0].toLowerCase())) {
    if (!"12345678".includes(fen[0].toLowerCase())) {
      throw Error("Invalid FEN : Must start with a piece or an empty space");
    }
  }
  let linkID = "";
  let waitingForLink = {};
  let irow = 0;
  let dynamitablesHasMovedIndexes = { w: 0, b: 0 };

  const createPiece = (pieceAttributes) => {
    try {
      const pieceClass = pieceClassesByID[pieceAttributes.id];
      let piece;
      if (pieceAttributes.phantomized) {
        piece = new Phantom(this, pieceAttributes.color, pieceAttributes.row, pieceAttributes.col);
        piece.transform(pieceClass.prototype);
      } else {
        piece = new pieceClass(
          this,
          pieceAttributes.color,
          pieceAttributes.row,
          pieceAttributes.col
        );
      }
      if (pieceAttributes.dynamited) {
        piece.setDynamite(true);
      }
      if (pieceAttributes.linkID) {
        const waitingPiece = waitingForLink[pieceAttributes.linkID];
        if (waitingPiece) {
          waitingPiece.linkedPiece = piece;
          piece.linkedPiece = waitingPiece;
        } else {
          waitingForLink[pieceAttributes.linkID] = piece;
        }
      }
      if (!Dynamite.UNDYNAMITABLES.includes(pieceAttributes.id)) {
        if (
          this.startFEN.dynamitablesHasMoved[pieceAttributes.color][
            dynamitablesHasMovedIndexes[pieceAttributes.color]
          ] === "1"
        ) {
          piece.firstMove = "done";
        }
        dynamitablesHasMovedIndexes[pieceAttributes.color]++;
      }
    } catch (error) {
      console.error(error);
    }
  };

  for (let row of pieces.split("/")) {
    let inParenthesis = false;
    let icol = 0;
    for (let char of row) {
      // Link ID
      if (inParenthesis) {
        if (char === ")") {
          inParenthesis = false;
          // console.log("Link ID :", linkID);
          lastPiece.linkID = linkID;
          continue;
        }
        if (!"0123456789".includes(char)) {
          throw Error("Invalid FEN : Parenthesis can only contain numbers");
        }
        linkID += char;
        continue;
      }
      if (char === "(") {
        inParenthesis = true;
        linkID = "";
        continue;
      }

      // Phantom
      if (char === "~") {
        if (lastPiece.phantomized) {
          throw Error("Invalid FEN : A piece can't be phantomized twice");
        }
        lastPiece.phantomized = true;
        continue;
      }

      // Dynamite
      if (char === "_") {
        if (lastPiece.dynamited) {
          throw Error("Invalid FEN : A piece can't be dynamited twice");
        }
        lastPiece.dynamited = true;
        continue;
      }

      // Empty spaces
      if ("0123456789".includes(char)) {
        icol += parseInt(char);
        continue;
      }

      // Piece creation
      if (lastPiece.id) {
        createPiece(lastPiece);
      }

      // Piece pre-creation
      lastPiece = {};
      const charLowerCase = char.toLowerCase();
      lastPiece.id = pieceIDbyFenID[charLowerCase];
      lastPiece.color = char === charLowerCase ? "b" : "w";
      lastPiece.row = irow;
      lastPiece.col = icol;
      icol++;
    }
    irow++;
  }
  createPiece(lastPiece);

  // TURN
  this.game.turn = turn;

  // CASTLE RIGHTS
  if (castleRights !== "-") {
    for (let castle of castleRights) {
      let rook = this.king[castle === castle.toUpperCase() ? "w" : "b"].getRookAt(
        castle.toUpperCase() === "K" ? "right" : "left"
      );
      if (!rook) {
        console.error("Error : wrong castle rights");
      } else {
        rook.firstMove = null;
      }
    }
  }

  // PIECE MOVING AGAIN
  if (pieceMovingAgain !== "-") {
    const [rowIndex, colIndex] = getRowColFromCoord(pieceMovingAgain);
    this.startFEN.pieceMovingAgain = this.get(rowIndex, colIndex);
    this.startFEN.pieceMovingAgain.stillHasToMove = true;
  }
};

IratusBoard.prototype.updateAllValidMoves = function () {
  Board.prototype.updateAllValidMoves.call(this);
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

  let lastMove = this.game.movesHistory.slice(-1)[0];
  let piece = lastMove ? lastMove.piece : this.startFEN.pieceMovingAgain;

  if (piece === "-") {
    return;
  }

  if (piece.stillHasToMove) {
    let clonedPiece = this.calculator.getSimulatedPiece(piece);
    let validMoves = [];
    for (let validMove of piece.validMoves) {
      let moveObject = this.calculator.move(clonedPiece.getPos(), Piece.getPos(validMove), true);
      for (let enemyClonedPiece of this.calculator.piecesColored[clonedPiece.enemyColor]) {
        enemyClonedPiece.updateValidMoves();
      }
      if (!this.calculator.king[piece.color].inCheck()) {
        validMoves.push(validMove);
      }
      this.calculator.undo(moveObject);
    }
    piece.validMoves = validMoves;
    if (piece.validMoves.length === 0) {
      throw Error;
    }
    for (let otherPiece of this.piecesColored[piece.color]) {
      if (otherPiece === piece) {
        continue;
      }
      otherPiece.validMoves.length = 0;
    }
  } else {
    for (let piece of this.piecesColored[this.game.turn]) {
      let clonedPiece = this.calculator.getSimulatedPiece(piece);
      let validMoves = [];
      if (piece.stillHasToMove === false) {
        for (let validMove of piece.validMoves) {
          let moveObject = this.calculator.move(
            clonedPiece.getPos(),
            Piece.getPos(validMove),
            true
          );
          for (let enemyClonedPiece of this.calculator.piecesColored[clonedPiece.enemyColor]) {
            enemyClonedPiece.updateValidMoves();
          }
          let valid;
          if (moveObject.nextTurn === piece.color) {
            valid = false;
            clonedPiece.updateValidMoves();
            for (let validMove2 of clonedPiece.validMoves) {
              let moveObject2 = this.calculator.move(
                clonedPiece.getPos(),
                Piece.getPos(validMove2),
                true
              );
              for (let enemyClonedPiece2 of this.calculator.piecesColored[clonedPiece.enemyColor]) {
                enemyClonedPiece2.updateValidMoves();
              }

              if (!this.calculator.king[piece.color].inCheck()) {
                valid = true;
              }
              this.calculator.undo(moveObject2);
              if (valid) {
                break;
              }
            }
          } else {
            valid = !this.calculator.king[piece.color].inCheck();
          }
          this.calculator.undo(moveObject);
          if (valid) {
            validMoves.push(validMove);
          }
        }
      } else {
        for (let validMove of piece.validMoves) {
          let moveObject = this.calculator.move(
            clonedPiece.getPos(),
            Piece.getPos(validMove),
            true
          );
          for (let enemyClonedPiece of this.calculator.piecesColored[clonedPiece.enemyColor]) {
            enemyClonedPiece.updateValidMoves();
          }
          if (!this.calculator.king[piece.color].inCheck()) {
            validMoves.push(validMove);
          }
          this.calculator.undo(moveObject);
        }
      }
      piece.validMoves = validMoves;
    }
  }
};

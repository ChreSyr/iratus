// CONSTRUCTOR

function IratusBoard(game) {
  Board.call(this, game, (nbranks = 10), (nbfiles = 8));

  this.calculatorClass = CalculatorIratusBoard;
}

// INHERITANCE

IratusBoard.emptyFEN =
  "fd(0)s(0)yys(1)d(1)g/rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR/FD(2)S(2)YYS(3)D(3)G w QKqk - - 0000000000000000-0000000000000000 0 1";
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

  if (!fen) {
    fen = storage.getItem("fen");
  }
  fen = fen ? fen : IratusBoard.emptyFEN;
  this.fromFEN = fen;
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
  if (!pieceIDs.includes(fen[0].toLowerCase())) {
    if (!"12345678".includes(fen[0].toLowerCase())) {
      throw Error("FEN incorrect :\nDoit commencer soit par l'id d'une pièce, soit par un nombre.");
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
      if (Dynamite.DYNAMITABLES.includes(pieceAttributes.id)) {
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
      throw Error("FEN incorrect :\nErreur lors de la création de " + pieceAttributes);
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
          lastPiece.linkID = linkID;
          continue;
        }
        if (!"0123456789".includes(char)) {
          throw Error("FEN incorrect :\nLes parenthèses n'accèptent que les nombres");
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
        lastPiece.phantomized = true;
        continue;
      }

      // Dynamite
      if (char === "_") {
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
      lastPiece.id = charLowerCase;
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
  if (Object.keys(this.king).length !== 2) {
    throw Error("FEN incorrect :\nIl manque un roi");
  }
  if (castleRights !== "-") {
    for (let castle of castleRights) {
      let rook = this.king[castle === castle.toUpperCase() ? "w" : "b"].getRookAt(
        castle.toUpperCase() === "K" ? "right" : "left"
      );
      if (!rook) {
        throw Error("FEN incorrect :\nImpossible d'appliquer les roques");
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

  // VALIDITY CHECK
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

  let validBlackMoves = [];

  if (iaMode && lastMove.nextTurn === "b") {
    for (let blackPiece of this.pieces) {
      if (blackPiece.color !== "b") {
        continue;
      }
      for (let validBlackMove of blackPiece.validMoves) {
        validBlackMoves.push([blackPiece, validBlackMove]);
      }
    }

    const getRandomFromList = (list) => {
      return list[Math.floor(Math.random() * list.length)];
    };

    let aiMove = getRandomFromList(validBlackMoves);
    if (aiMove === undefined) {
      return; // checkmate or pat
    }
    let aiPiece = aiMove[0];
    let aiValidMove = aiMove[1];

    setTimeout(() => {
      if (this.game.turn !== "b") {
        return;
      }
      this.game.move(
        (start = [aiPiece.row, aiPiece.col]),
        (end = [aiValidMove[0], aiValidMove[1]])
      );
    }, 1000);
  }
};

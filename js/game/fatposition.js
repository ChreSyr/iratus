/* FEN - Forsyth-Edwards Notation
https://fr.wikipedia.org/wiki/Notation_Forsyth-Edwards
*/
const fenIDbyPieceID = {
  k: "k",
  q: "q",
  r: "r",
  b: "b",
  n: "n",
  i: "p",
  dy: "y",
  s: "s",
  es: "e",
  d: "d",
  ed: "o",
  p: "h",
  g: "g",
};

// CONSTRUCTOR
function FatPosition(board, turn) {
  this.piecesByPos = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ];

  for (let piece of board.pieces) {
    if (!piece.isCaptured) {
      this.piecesByPos[piece.getPos()] = piece.ID;
    }
  }

  this.casteRights = board.king["w"].castleRights + board.king["b"].castleRights;
  this.turn = turn;

  // FEN notation

  // Pieces position
  let fen = "";
  for (let row = 0; row < 10; row++) {
    let space = 0;
    for (let col = 0; col < 8; col++) {
      piece = board.get(row, col);
      if (piece === null) {
        space += 1;
      } else {
        if (space > 0) {
          fen += space;
          space = 0;
        }
        if (piece.color === "b") {
          fen += fenIDbyPieceID[piece.ID];
        } else {
          fen += fenIDbyPieceID[piece.ID].toUpperCase();
        }
      }
    }
    if (space > 0) {
      fen += space;
    }
    if (row < 9) {
      fen += "/";
    }
  }

  // Turn
  fen += " " + turn + " ";

  // Castle Rights
  let allCastleRights = "";
  for (let color of ["w", "b"]) {
    const king = board.king[color];
    let castleRights = "";
    if (king.castleRights[0] === "1") {
      castleRights += "q";
    }
    if (king.castleRights[1] === "1") {
      castleRights += "k";
    }
    if (color === "w") {
      castleRights = castleRights.toUpperCase();
    }
    allCastleRights += castleRights;
  }
  fen += allCastleRights ? allCastleRights : "-";

  // En Passant
  lastMove = board.game.movesHistory.slice(-1)[0];
  if (
    lastMove &&
    lastMove.piece.ID === "i" &&
    Math.abs(lastMove.start[0] - lastMove.end[0]) === 2
  ) {
    const row = board.nbranks - lastMove.end[0] - (lastMove.turn === "w" ? 1 : -1);
    const col = fileDict[lastMove.end[1]];
    fen += " " + col + row;
  } else {
    fen += " -";
  }

  // 50 moves rule & Turn number
  if (lastMove) {
    fen += " " + lastMove.counter50rule;
    fen += " " + Math.floor(lastMove.turnNumber + 0.5);
  } else {
    fen += " 0 1";
  }

  this.fen = fen;

  const _EQ_ATTRIBUTES = ["castleRights", "turn"];

  this.equals = function (other) {
    // NOTE : according to FIDE rules, I should check if en passant abilities are the same

    for (let attr of _EQ_ATTRIBUTES) {
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
  };
}

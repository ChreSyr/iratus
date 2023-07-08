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

let ids = Object.values(fenIDbyPieceID).join(""); // Concatenate the piece IDs
ids = ids + ids.toUpperCase() + "~_0-9"; // max 10 linked pieces
const fenRegexPattern = `^([${ids}1-8]+\\/){9}[${ids}1-12]+\\s[wb]\\s(-|[KQkq]+)\\s(-|[a-h][2-9])\\s\\d+\\s\\d+$`;
const fenRegex = new RegExp(fenRegexPattern);
function isValidFEN(fen) {
  return fenRegex.test(fen);
}

console.log(ids);
console.log(isValidFEN("hdsyysdg/rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR/HDSYYSDG w - - 0 1"));
console.log(
  isValidFEN("hdsyysdg/rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR/HDSYYSDG b - e4 0 1")
);
console.log(
  isValidFEN("hd0s0y1s1d1g/rnbqk2r/ppppppb_p/5np1/8/8/P1N5/S_2PPPPPPP/RD_2BQKBNR/H4S3D3G b k - 2 5")
);

// CONSTRUCTOR
function FEN(board, turn) {
  let fen = "";

  // Pieces position
  let linkedPieces = { i: 0 };
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
        if (piece.dynamited) {
          fen += "_";
        }
        if (piece.cssClass === "phantom" && piece.ID !== "p") {
          fen += "~";
        }
        if (piece.linkedPiece) {
          const pieceCoord = piece.getCoordinates();
          const linkedPieceCoord = piece.linkedPiece.getCoordinates();
          if (Object.keys(linkedPieces).includes(linkedPieceCoord)) {
            linkedPieces[pieceCoord] = linkedPieces[linkedPieceCoord];
          } else {
            linkedPieces[pieceCoord] = linkedPieces.i;
            linkedPieces.i++;
          }
          fen += linkedPieces[pieceCoord];
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

  // Same position if same pieces, turn, castleRights & enPassant
  this.fenEqualizer = fen;

  // 50 moves rule & Turn number
  if (lastMove) {
    fen += " " + lastMove.counter50rule;
    fen += " " + Math.floor(lastMove.turnNumber + 0.5);
  } else {
    fen += " 0 1";
  }

  // Final FEN
  this.fen = fen;

  this.equals = function (other) {
    return this.fenEqualizer === other.fenEqualizer;
  };
}

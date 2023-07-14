/* FEN - Forsyth-Edwards Notation
https://fr.wikipedia.org/wiki/Notation_Forsyth-Edwards
*/

pieceIDs = "bcdefgknpqrsy";
ids = pieceIDs + pieceIDs.toUpperCase() + "~_()0-9";
const fenRegexPattern = `^([${ids}]+\\/){9}[${ids}]+\\s[wb]\\s(-|[KQkq]+)\\s(-|[a-h][1-8])\\s(-|[a-h]([0-9]|10))\\s(([01]+)?-([01]+)?)\\s\\d+\\s\\d+$`;
const fenRegex = new RegExp(fenRegexPattern);
function isValidFEN(fen) {
  // Warning : this function checks the syntax pattern of the FEN notation,
  // but it does not validate the actual chess positions or game rules.
  // Exemple : 9 pieces in one row will not be detected here
  return fenRegex.test(fen);
}

// CONSTRUCTOR
function FEN(board, turn) {
  /* DOCUMENTATION 
  
  Works just like a chess FEN

  ~ : after a phantomized piece
  _ : after a dynamited piece
  (X) : after a linked piece, X is the link ID

  pieces turn castleRights enPassant pieceMovingAgain dynamitablesHasMoved counter50rule turnNumber

  3 times repetition : if pieces, turn, castleRights, enPassant & pieceMovingAgain are the same
  
  pieceMovingAgain :

    coordinate or "-"
    exemples : "a4" or "-"

    If a PieceMovingTwice has moved once, this is the coordinates of this piece.

  dynamitablesHasMoved :

    listOf0or1 + "-" + listOf0or1
    exemple : 001110110010000-00000000111011001

    The first list represents the white dynamitable pieces, the seceond represents the black dynamitable pieces.
    From white's perspective, from left to right then top to bottom.

    0 : the piece has not moved yet
    1 : the piece already moved
  
  */
  let fen = "";

  // Pieces position
  let linkedPieces = { i: 0 };
  let dynamitablesHasMoved = { w: "", b: "" };
  let coordsPieceMovingAgain = "-";
  for (let row = 0; row < 10; row++) {
    let space = 0;
    for (let col = 0; col < 8; col++) {
      piece = board.get(row, col);

      if (piece === null) {
        space += 1;
        continue;
      }

      if (space > 0) {
        fen += space;
        space = 0;
      }
      if (piece.color === "b") {
        fen += piece.ID;
      } else {
        fen += piece.ID.toUpperCase();
      }
      if (piece.dynamited) {
        fen += "_";
      }
      if (piece.cssClass === "phantom" && piece.ID !== "p") {
        fen += "~";
      }
      if (piece.linkedPiece && !piece.linkedPiece.isCaptured) {
        const pieceCoord = piece.getCoordinates();
        const linkedPieceCoord = piece.linkedPiece.getCoordinates();
        if (Object.keys(linkedPieces).includes(linkedPieceCoord)) {
          linkedPieces[pieceCoord] = linkedPieces[linkedPieceCoord];
        } else {
          linkedPieces[pieceCoord] = linkedPieces.i;
          linkedPieces.i++;
        }
        fen += "(" + linkedPieces[pieceCoord] + ")";
      }
      if (Dynamite.DYNAMITABLES.includes(piece.ID)) {
        dynamitablesHasMoved[piece.color] += piece.hasMoved() ? "1" : "0";
      }
      if (piece.stillHasToMove) {
        coordsPieceMovingAgain = piece.getCoordinates();
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
    const leftRook = king.getRookAt("left");
    if (leftRook && !leftRook.hasMoved() && !king.hasMoved()) {
      castleRights += "q";
    }
    const rightRook = king.getRookAt("right");
    if (rightRook && !rightRook.hasMoved() && !king.hasMoved()) {
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
  if (lastMove) {
    fen += " " + lastMove.enPassant;
  } else {
    fen += " -";
  }

  // PieceMovingAgain
  fen += " " + coordsPieceMovingAgain;

  // Same position if same pieces, turn, castleRights & enPassant
  this.fenEqualizer = fen;

  // Dynamitables has moved
  fen += " " + dynamitablesHasMoved["w"] + "-" + dynamitablesHasMoved["b"];

  // 50 moves rule & Turn number
  if (lastMove) {
    fen += " " + lastMove.counter50rule;
    fen += " " + lastMove.turnNumber;
  } else {
    fen += " " + board.startFEN.counter50rule;
    fen += " " + board.startFEN.turnNumber;
  }

  // Final FEN
  this.fen = fen;

  this.equals = function (other) {
    return this.fenEqualizer === other.fenEqualizer;
  };
}

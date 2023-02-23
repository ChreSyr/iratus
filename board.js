
class IratusBoard {

  NBRANKS = 10;
  NBFILES = 8;

  constructor(game) {

    this.game = game;
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
    this.pieces = [];
    this.piecesColored = {"w": [], "b": []};
    this.calculator = null;
    this.createPieces();

    this.currentMove = {};  // TODO change
  }

  addPiece(piece) {
    this.pieces.push(piece);
    this.piecesByPos[piece.getPos()] = piece;
    this.piecesColored[piece.color].push(piece);
  }

  createPieces() {
    let iratusBoard = [
      [" ", " ", " ", "DY", "DY", " ", " ", " "],
      ["R", "N", "B", "Q", "K", "B", "N", "R"],
      ["i", "i", "i", "i", "i", "i", "i", "i"],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      ["i", "i", "i", "i", "i", "i", "i", "i"],
      ["R", "N", "B", "Q", "K", "B", "N", "R"],
      [" ", " ", " ", "DY", "DY", " ", " ", " "],
    ];
    let pieceClasses = {
      "K": null,
      "Q": null,
      "R": Rook,
      "B": null,
      "N": Knight,
      "i": null,
      "DY": Dynamite,
      " ": null,
    }
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 8; col++) {
        let pieceClass = pieceClasses[iratusBoard[row][col]];
        if (pieceClass !== null) {
          new pieceClass(this, row, col);
        }
      }
    }
  }

  get(row, col) {
    return this.piecesByPos[col * 10 + row];
  }
  
  initDisplay() {
    this.calculator = new CalculatorIratusBoard(this);
    for (let piece of this.pieces) {
      piece.initDisplay();
    }
  }

  set(piece, pos) {
    this.piecesByPos[pos] = piece;
  }

}

class CalculatorIratusBoard extends IratusBoard {

  constructor(board) {
    super(board.game);

    this.real_board = board;
    this.pieces_correspondence = {};
    for (let [i, piece] of board.pieces.entries()) {
      this.pieces_correspondence[piece] = this.pieces[i]
    }
  }

}
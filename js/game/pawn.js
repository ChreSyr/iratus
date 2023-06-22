
class Pawn extends Piece {

  static ID = "i";
  static ATTR_TO_COPY = Piece.ATTR_TO_COPY.concat(["attackingMoves", "promotionRank"]);

  constructor(board, row, col) {
    super(board, row, col);

    this.attackingMoves = undefined;
    this.promotionRank = undefined;
  
    Pawn.preciseTransform(this);
  }

  static goTo(row, col) {
    let commands = super.goTo(row, col);

    if (this.row === this.promotionRank) {
      if (this.widget && this instanceof Pawn) {  // a phantom cannot promote
        this.openPromotionWindow();
      }
    }

    // en passant
    let stepback = this.color === "w" ? 1 : -1;
    let pieceBehind = this.board.get(this.row + stepback, this.col);
    if (pieceBehind === undefined) {
      // Very rare case where the black phantom is a pawn at the topleft corner or
      // the white phantom is a pawn at the bottomright corner of the board
      return commands;
    } else if (pieceBehind !== null && pieceBehind.color !== this.color && pieceBehind.ID === "i") {
      let lastMove = this.board.game.movesHistory.slice(-1)[0];
      if (this.board.get(lastMove.end[0], lastMove.end[1]) === pieceBehind && lastMove.start[0] !== this.row && lastMove.start[1] === this.col) {
        commands.push(new Capture(pieceBehind, this));
      }
    }

    return commands;
  }

  openPromotionWindow() {
    this.board.pawnToPromote = this;
    const promotionWindow = document.getElementsByClassName("promotion-window")[0];
    let promotionPieces = document.getElementsByClassName("promotion-piece");
    for (let promotionPiece of promotionPieces) {
      promotionPiece.classList.add(this.color + promotionPiece.classList[1]);
    }
    if (this.color === "w") { // TODO : what if the board is flipped ?
      promotionWindow.classList.add("top");
    } else {
      promotionWindow.classList.remove("top");
    }
    promotionWindow.style.transform = `translateX(${this.col * 100}%)`;
    promotionWindow.style.display = "flex";
  }

  static preciseTransform(piece) {

    if (piece.color === "b") {
      piece.MOVES = [[1, 0], [2, 0]];
      piece.attackingMoves = [[1, 1], [1, -1]];
      piece.promotionRank = 9;
    } else {
      piece.MOVES = [[-1, 0], [-2, 0]];
      piece.attackingMoves = [[-1, 1], [-1, -1]];
      piece.promotionRank = 0;
    }
  }

  static redo(row, col) {
    super.goTo(row, col)
  }

  static updateValidMoves() {

    if (this.isCaptured) {return}

    this.validMoves = [];
    this.antikingSquares = [];

    for (let move of this.MOVES) {
      let row = this.row + move[0];
      let col = this.col + move[1];
      
      if (row < 0 || row > 9 || col < 0 || col > 7) {continue}

      if (this.board.get(row, col) === null) {
        this.validMoves.push([row, col]);
      } else {
        break;
      }
    }

    for (let move of this.attackingMoves) {
      let row = this.row + move[0];
      let col = this.col + move[1];

      if (row < 0 || row > 9 || col < 0 || col > 7) {continue}

      this.antikingSquares.push([row, col]);

      let attackedPiece = this.board.get(row, col);
      if (attackedPiece === null) {

        // en passant
        let asidePiece = this.board.get(this.row, col);
        if (asidePiece !== null && asidePiece.ID === "i" && asidePiece.color !== this.color) {
          let lastMove = this.board.game.movesHistory.slice(-1)[0];
          if (this.board.get(lastMove.end[0], lastMove.end[1]) === asidePiece && lastMove.start[0] !== row) {
            this.validMoves.push([row, col]);
          }
        }
      } else if (this.canGoTo(row, col)) {
        this.validMoves.push([row, col]);
      }
    }
  }
}
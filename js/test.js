
/*      piece.getPos()
     ___ ___ ___ ___ ___ ___ ___ ___
10  |0  |10 |20 |30 |40 |50 |60 |70 |
    |___|___|___|___|___|___|___|___|
9   |1  |11 |21 |31 |41 |51 |61 |71 |
    |___|___|___|___|___|___|___|___|
8   |2  |12 |22 |32 |42 |52 |62 |72 |
    |___|___|___|___|___|___|___|___|
7   |3  |13 |23 |   |   |   |   |   |
    |___|___|___|___|___|___|___|___|
6   |4  |14 |24 |   |   |   |   |   |
    |___|___|___|___|___|___|___|___|
5   |5  |15 |25 |   |   |   |   |   |
    |___|___|___|___|___|___|___|___|
4   |6  |16 |26 |   |   |   |   |   |
    |___|___|___|___|___|___|___|___|
3   |7  |17 |27 |   |   |   |   |   |
    |___|___|___|___|___|___|___|___|
2   |8  |18 |28 |   |   |   |   |   |
    |___|___|___|___|___|___|___|___|
1   |9  |19 |29 |   |   |   |   |79 |
    |___|___|___|___|___|___|___|___|

      a   b   c   d   e   f   g   h
*/

const fileDict = {0:"a", 1:"b", 2:"c", 3:"d", 4:"e", 5:"f", 6:"g", 7:"h"}

class Piece {

  static ID = "";
  static MOVES = [];

  // these are used for piece.transform()
  static ATTR_TO_COPY = ["ID", "MOVES", "RANGE"];
  static METH_TO_COPY = ["canGoTo", "capture", "capturerCheck", "copyFrom", "goTo", "redo", "uncapture", "undo", "updateValidMoves"];

  constructor(board, row, col) {

    this.ID = this.constructor.ID;
    this.MOVES = this.constructor.MOVES;
    this.RANGE = this.constructor.RANGE;
    for (let meth of this.constructor.METH_TO_COPY) {
      this[meth] = this.constructor[meth];
    }

    this.board = board;
    this.row = parseInt(row);
    this.col = parseInt(col);
    this.color = row > 4 ? "w" : "b";
    this.enemyColor = this.color === "b" ? "w" : "b";
    this.firstMove = null;
    this.validMoves = [];
    this.antikingSquares = [];
    this.isCaptured = false;
    this.dynamited = false;
    // for transformation memory
    this.actualClass = this.constructor;

    this.isWidgeted = false;
    this.widget = null;
    this.cssClass = undefined;

    this.board.addPiece(this);
  }
  
  static canGoTo(row, col) {

    let piece = this.board.get(row, col);
    if (piece === null) {
      return true;
    } else if (piece.ID === "dy") {
      return piece.color === this.color && ! Dynamite.UNDYNAMITABLES.includes(this.ID);
    } else {
      return piece.color !== this.color;
    }
  }

  static capture(capturer) {

    let commands = [];

    this.board.piecesByPos[this.getPos()] = null;
    this.isCaptured = true;
    this.validMoves.length = 0;
    this.antikingSquares.length = 0;

    if (this.isWidgeted) {
      // update the display
      this.killWidget();
    }

    if (this.dynamited && ! capturer.isCaptured) {
      commands.push(new Capture(capturer, this));
      commands.push(new NotationHint("*"));
    }

    let alliedPhantom = this.board.phantom[this.color];
    if (! alliedPhantom.isCaptured) {
      commands.push(new Transform(alliedPhantom, alliedPhantom.actualClass, this.actualClass));
    }

    return commands;
  }

  static capturerCheck() {
    return true;
  }

  static copyFrom(original) {
    this.isCaptured = original.isCaptured;
    if (this.isCaptured) {return}

    this.row = original.row;
    this.col = original.col;
    this.board.piecesByPos[this.getPos()] = this;
    this.firstMove = original.firstMove;
  }

  getCoordinates() {
    return fileDict[this.col] + (this.board.NBRANKS - this.row);
  }

  static getPos(list) {
    return list[1] * 10 + list[0];
  }

  getPos() {
    return this.col * 10 + this.row;
  }

  getNextPos(validMove) {
    return (this.col + validMove[1]) * 10 + this.row + validMove[0];
  }

  getSquare() {
    return document.getElementById("squares").querySelector(`[data-row="${this.row}"][data-col="${this.col}"]`);
  }
  
  static goTo(row, col) {

    let commands = [];

    let oldPos = this.getPos();
    this.row = parseInt(row);
    this.col = parseInt(col);
    if (this.isCaptured) {return commands}

    this.board.piecesByPos[oldPos] = null;
    this.board.piecesByPos[this.getPos()] = this;

    if (this.firstMove === null) {
      this.firstMove = this.board.currentMove;
    }

    // update the display
    if (this.widget !== null) {  
      this.widget.classList.remove("square-" + oldPos);
      this.widget.classList.add("square-" + this.getPos());
    }

    // if (this.cell !== null) {  // update the display
     
    //   this.cell.style.backgroundImage = "";
    //   if (this.cssClass) {
    //     this.cell.classList.remove(this.cssClass);
    //   }
    //   if (this.dynamited) {
    //     this.cell.extracell.style.backgroundImage = "";
    //   }
    //   this.cell.piece = null;
    //   this.cell = this.getSquare().cell;
    //   this.cell.style.backgroundImage = "url('images/" + this.color + this.ID + ".png')";
    //   if (this.cssClass) {
    //     this.cell.classList.add(this.cssClass);
    //   }
    //   if (this.dynamited) {
    //     this.cell.extracell.style.backgroundImage = "url('images/" + this.color + "dy.png')";
    //   }
    //   this.cell.piece = this;
    // }

    return commands;
  }

  hasMoved() {
    return this.firstMove !== null;
  }

  static preciseTransform(piece) {}

  static redo(row, col) {
    this.goTo(row, col);
  }
  
  setDynamite(val) {
    this.dynamited = val;

    // update the display
    if (this.widget !== null) {
      if (this.dynamited) {
        this.widget.classList.add("dynamited");
      } else {
        this.widget.classList.remove("dynamited");
      }
    }
  }

  transform(pieceClass) {
    if (this.actualClass === pieceClass) {return}

    let oldClass = this.actualClass;
    this.actualClass = pieceClass;

    for (let attr of pieceClass.ATTR_TO_COPY) {
      this[attr] = pieceClass[attr];
    }
    for (let meth of pieceClass.METH_TO_COPY) {
      this[meth] = pieceClass[meth];
    }

    pieceClass.preciseTransform(this);

    if (this.widget !== null) {
      this.widget.classList.remove(this.color + oldClass.ID);
      this.widget.classList.add(this.color + this.ID);

      // for calculations
      this.board.calculator.getSimulatedPiece(this).transform(pieceClass);
    }
  }

  static uncapture() {
    this.board.piecesByPos[this.getPos()] = this;
    this.isCaptured = false;

    if (this.isWidgeted) {
      // update the display
      this.createWidget();
    }
  }

  static undo(move) {
    this.goTo(move.start[0], move.start[1]);
    if (this.firstMove === move) {
      this.firstMove = null;
    }
  }

  static updateValidMoves() {

    if (this.isCaptured) {return}

    this.validMoves = [];
    this.antikingSquares = [];

    for (let move of this.MOVES) {
      let row = this.row + move[0];
      let col = this.col + move[1];
      
      if (row < 0 || row > 9 || col < 0 || col > 7) {continue}
      
      this.antikingSquares.push([row, col]);
      if (this.canGoTo(row, col)) {
        this.validMoves.push([row, col]);
      }
    }
  }

  // VIEW METHODS

  createWidget() {

    if (this.isWidgeted === false) {throw Error("Can't widgetize a piece made for calculation")}
    if (this.widget !== null) {throw Error("This piece already has a widget")}

    this.widget = document.createElement("div");
    this.widget.classList.add("piece");
    this.widget.classList.add(this.color + this.ID);
    this.widget.classList.add("square-" + this.getPos());
    if (this.cssClass === "phantom") {
      this.widget.classList.add("phantom");
    }
    this.widget.piece = this;
    makePieceDraggable(this.widget);
    this.board.widget.appendChild(this.widget);

  }

  handlePointerDown() {

    if (this.board.selectedPiece !== null) {
      this.board.selectedPiece.unselect();
    }
    
    const squareSelected = document.createElement("div");
    squareSelected.classList.add("square");
    squareSelected.classList.add("selected");
    squareSelected.classList.add("square-" + this.getPos());
    this.board.widget.appendChild(squareSelected);
    this.board.squareSelected = squareSelected;

    this.board.selectedPiece = this;

    if (this.board.game.turn !== this.color) {return}

    for (let validMove of this.validMoves) {
      const movePos = validMove[1] * 10 + validMove[0];
      const squareAccessible = document.createElement("div");
      squareAccessible.classList.add("square");
      squareAccessible.classList.add("accessible");
      if (this.board.piecesByPos[movePos] !== null) {
        squareAccessible.classList.add("captureable");
      }
      squareAccessible.classList.add("square-" + movePos);
      squareAccessible.dataset.row = validMove[0];
      squareAccessible.dataset.col = validMove[1];
      makeSquareClickable(squareAccessible);
      this.board.widget.appendChild(squareAccessible);
      this.board.squaresAccessible.push(squareAccessible);
    }
  }

  killWidget() {
    
    if (this.widget === null) {return}

    this.widget.remove();
    this.widget = null;

  }

  unselect() {

    if (this.board.selectedPiece === null) {return}

    this.board.squareSelected.classList.remove("square-" + this.board.selectedPiece.getPos());
    this.board.squareSelected.remove();
    this.board.squareSelected = null;

    this.board.selectedPiece = null;
    
    for (let squareAccessible of this.board.squaresAccessible) {
      squareAccessible.remove();
    }
    this.board.squaresAccessible.length = 0;

  }
}

class Dynamite extends Piece {

  static ID = "dy";
  static UNDYNAMITABLES = ["k", "q", "r", "dy", "p", "g"];

  static capture(capturer) {
    let commands = super.capture(this, capturer);
    commands.splice(commands.indexOf(commands.find(commandToRem => commandToRem.name === "transform")));  // remove phantomisation
    if (capturer !== this) {  // when an ally goes to the dynamite
      commands.push(new SetDynamite(capturer));
    }
    return commands;
  }

  static capturerCheck() {
    return false;
  }

  static copyFrom(original) {
    this.isCaptured = original.isCaptured;
    if (this.isCaptured) {return}
    this.board.piecesByPos[original.getPos()] = this;
  }

  static goTo(row, col) {  // when the dynamite goes to an ally
    let commands = [];
    commands.push(new Capture(this, this));
    commands.push(new SetDynamite(this.board.get(row, col)));
    return commands;
  }

  static updateValidMoves() {
    
    if (this.isCaptured) {return}

    this.validMoves = [];
    // this.antiking_squares = [[this.row, this.col]];

    for (let piece of this.board.piecesColored[this.color]) {
      if (piece.isCaptured) {continue}
      if (piece.dynamited) {continue}
      if (Dynamite.UNDYNAMITABLES.includes(piece.ID)) {continue}
      if (piece.constructor.ID === "p") {continue}
      if (! piece.hasMoved()) {
        this.validMoves.push([piece.row, piece.col])
      }
    }
  }
}

class King extends Piece {

  static ID = "k";
  static MOVES = [
    [0, 1],
    [0, -1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [1, 1],
    [1, 0],
    [1, -1],
  ];

  // long castle right + short castle right
  castleRights = "00"
  
  static canGoTo(row, col) {

    if (this.posIsUnderCheck(row, col)) {
      return false;
    }
    let piece = this.board.get(row, col);
    if (piece === null) {
      return true;
    } else if (piece.ID === "dy") {
      return false;
    } else {
      return piece.color !== this.color && ! piece.dynamited;
    }
  }

  copyFrom(original) {
    super.copyFrom(original);
    this.firstMove = original.firstMove;
    this.castleRights = original.castleRights;
  }

  static goTo(row, col) {

    let hasMoved = this.hasMoved();
    let commands = super.goTo(row, col);

    if (! hasMoved) {

      if (col === 2 && this.castleRights[0] === "1") {  // Long castle
        commands.push(new AfterMove([row, col - 2], [row, col + 1]));
        commands.push(new Notation("0-0-0"));
      }

      else if (col === 6 && this.castleRights[1] === "1") {  // Short castle
        commands.push(new AfterMove([row, col + 1], [row, col - 1]));
        commands.push(new Notation("0-0"));
      }
    }

    return commands;
  }
  
  inCheck() {
    return this.posIsUnderCheck(this.row, this.col);
  }

  posIsUnderCheck(row, col) {
    for (let piece of this.board.piecesColored[this.enemyColor]) {

      // the phantom's antiking squares can change after a capture
      // so they are taken in account only during calculation
      if (piece.widget && piece.cssClass === "phantom")
        {continue}

      if (! piece.isCaptured) {
        for (let antiking of piece.antikingSquares) {
          if (row === antiking[0] && col === antiking[1]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  static updateValidMoves() {
    super.updateValidMoves();

    if (! this.hasMoved() && ! this.inCheck()) {
      // long castle
      let canLongCastle = false;
      let pieceAtLeftCorner = this.board.get(this.row, this.col - 4);
      if (pieceAtLeftCorner !== null && pieceAtLeftCorner.ID === "r" && ! pieceAtLeftCorner.hasMoved()) {
        canLongCastle = true;
        for (let dx of [-1, -2]) {
          if (this.board.get(this.row, this.col + dx) !== null) {
            canLongCastle = false;
            break;
          }
          if (this.posIsUnderCheck(this.row, this.col + dx)) {
            canLongCastle = false;
            break;
          }
        }
        if (this.board.get(this.row, this.col - 3) !== null) {
          canLongCastle = false;
        }
        if (canLongCastle) {
          this.validMoves.push([this.row, this.col - 2]);
        }
      }
      // short castle
      let canShortCastle = false;
      let pieceAtRightCorner = this.board.get(this.row, this.col + 3);
      if (pieceAtRightCorner !== null && pieceAtRightCorner.ID === "r" && ! pieceAtRightCorner.hasMoved()) {
        canShortCastle = true;
        for (let dx of [1, 2]) {
          if (this.board.get(this.row, this.col + dx) !== null || this.posIsUnderCheck(this.row, this.col + dx)) {
            canShortCastle = false;
            break;
          }
        }
        if (canShortCastle) {
          this.validMoves.push([this.row, this.col + 2]);
        }
      }

      this.castleRights = (canLongCastle === true ? "1" : "0") + (canShortCastle === true ? "1" : "0")
    }
  }
}

class Knight extends Piece {

  static ID = "n";
  static MOVES = [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ];
}

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

class Phantom extends Piece {

  static ID = "p";

  constructor(board, row, col) {
    super(board, row, col);

    this.cssClass = "phantom";
  }
  
  static canGoTo(row, col) {

    let piece = this.board.get(row, col);
    if (piece === null) {
      return true;
    } else if (piece.ID === "dy") {
      return false;
    } else {
      return piece.color !== this.color;
    }
  }
}

class RollingPiece extends Piece {

  static RANGE = 10;

  static updateValidMoves() {

    if (this.isCaptured) {return}
    
    this.validMoves = [];
    this.antikingSquares = [];
    for (let i = 0; i < this.MOVES.length; i++) {
      let move = this.MOVES[i];
      let row = this.row + move[0];
      let col = this.col + move[1];
      
      for (let iRange = 0; iRange < this.RANGE; iRange++) {

        if (row < 0 || row > 9 || col < 0 || col > 7) {break}

        this.antikingSquares.push([row, col]);
        if (this.canGoTo(row, col)) {
          this.validMoves.push([row, col]);
          if (this.board.get(row, col) !== null) {
            break;
          }
          row += move[0];
          col += move[1];
        } else {
          break;
        }
      }
    }
  }
}

class Bishop extends RollingPiece {

  static ID = "b";
  static MOVES = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
}

class Grapple extends RollingPiece {
  static ID = "g";
  static MOVES = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  static canGoTo(row, col) {
    let piece = this.board.get(row, col);
    if (piece === null) {
      return true;
    } else if (piece.ID === "dy") {
      return false;
    } else {
      return true;
    }
  }

  static capturerCheck() {
    return false;
  }

  static goTo(row, col) {
    let grappledPiece = this.board.get(row, col);
    if (! grappledPiece) {return super.goTo(row, col)}
    const getCoord = (piece) => fileDict[piece.col] + (this.board.NBRANKS - piece.row);
    let commands = [];

    let notation = "G:";
    if (grappledPiece.ID !== "i") {
      notation += grappledPiece.ID.toUpperCase();
    }
    notation += getCoord(grappledPiece) + "->" + getCoord(this);  // ex : G:Nf6->d4
    commands.push(new Notation(notation));
    commands.push(new Capture(this, this));
    commands.push(new AfterMove([grappledPiece.row, grappledPiece.col], [this.row, this.col]));
    return commands;
  }

  static updateValidMoves() {
    super.updateValidMoves();
    this.antikingSquares.length = 0;
  }
}

class Queen extends RollingPiece {

  static ID = "q";
  static MOVES = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
}

class Rook extends RollingPiece {

  static ID = "r";
  static MOVES = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
}

class PieceMovingTwice extends Piece {

  // TODO : solve : an enraged dog doesn't know he can capture a checking piece that requires him two moves to reach

  static stillHasToMove = false;
  static ATTR_TO_COPY = Piece.ATTR_TO_COPY.concat(["stillHasToMove"]);

  constructor(board, row, col) {
    super(board, row, col);

    this.stillHasToMove = false;
  }

  static copyFrom(original) {
    super.copyFrom(original);
    if (! this.isCaptured) {
      this.stillHasToMove = original.stillHasToMove;
    }
  }

  static goTo(row, col) {
    let commands = super.goTo(row, col);

    // required because of the grapple  // TODO : why ???
    if (this.cell) {
      let lastMove = this.board.game.movesHistory.slice(-1)[0];
      if (lastMove === undefined || (lastMove.piece === this && (lastMove.end[0] !== row || lastMove.end[1] !== col))) {
        this.stillHasToMove = false;
        return commands;
      }
    }

    // if captured, ignore second move
    for (let command of commands) {
      if (command.name === "capture" && command.args[0] === this) {
        this.stillHasToMove = false;
        return commands;
      }
    }
    if (this.isCaptured) {
      this.stillHasToMove = false;
      return commands;
    }

    if (this.board.mainCurrentMove.piece === this) {
      this.stillHasToMove = ! this.stillHasToMove;
      if (this.stillHasToMove) {
        commands.push(new SetNextTurn(this.color));
      }
    }

    return commands;
  }

  static undo(move) {
    super.undo(move);

    if (this.board.game.movesHistory.length) {
      let lastMove = this.board.game.movesHistory.slice(-1)[0];
      this.stillHasToMove = lastMove.piece === this;
    }
  }

  static updateValidMoves() {
    if (this.isCaptured) {return}

    this.validMoves = [];
    this.antikingSquares = [];

    for (let move of this.MOVES) {
      let row = this.row + move[0];
      let col = this.col + move[1];
      
      if (row < 0 || row > 9 || col < 0 || col > 7) {continue}
      
      this.antikingSquares.push([row, col]);
      if (this.canGoTo(row, col)) {
        this.validMoves.push([row, col]);

        for (let move2 of this.MOVES) {
          let row2 = row + move2[0];
          let col2 = col + move2[1];

          if (row2 < 0 || row2 > 9 || col2 < 0 || col2 > 7) {continue}  // out of board
          if (this.row === row2 && this.col === col2) {continue}  // can't protect itself
          if (this.antikingSquares.find(move => move[0] === row2 && move[1] === col2)) {continue}  // already in antikingSquares

          this.antikingSquares.push([row2, col2]);
        }
      }
    }
  }
}

class Soldier extends RollingPiece {
  static ID = "s";
  static RANGE = 2;

  constructor(board, row, col) {
    super(board, row, col);

    this.dog = undefined;

    if (col < 4) {
      this.dog = board.get(row, col - 1);
      this.dog.soldier = this;
    }

    Soldier.preciseTransform(this);
  }
  
  static canGoTo(row, col) {

    let piece = this.board.get(row, col);
    if (piece === null) {
      return true;
    } else if (piece.ID === "dy") {
      return piece.color === this.color && ! Dynamite.UNDYNAMITABLES.includes(this.ID);
    } else {
      return piece.color !== this.color && piece.ID === "i";  // only captures pawns
    }
  }

  static capture(capturer) {
    let commands = super.capture(capturer);

    if (! this.dog) {return commands}  // happens when this is the phantom

    if (! this.dog.isCaptured) {
      commands.push(new Transform(this.dog, this.dog.actualClass, EnragedDog));  // enrage dog
    } else {
      commands.splice(commands.indexOf(commands.find(commandToRem => commandToRem.name === "transform")));  // remove leash phantomisation, stays dog
    }

    return commands;
  }

  static goTo(row, col) {
    let startRow = this.row, startCol = this.col;
    let commands = super.goTo(row, col);

    if (! this.dog) {return commands}  // happens when this is the phantom

    if (this.row === this.promotionRank) {
      commands.push(new Transform(this, this.actualClass, EliteSoldier));
    }

    if (dogIsTooFar(this.row, this.col, this.dog.row, this.dog.col)) {
      commands.push(new AfterMove([this.dog.row, this.dog.col], getNewDogRC(startRow, startCol, this.row, this.col)));
    }

    return commands;
  }

  static preciseTransform(piece) {

    if (! piece instanceof Soldier) {
      piece.dog = null;
    }

    if (piece.color === "b") {
      piece.MOVES = [[1, 1], [1, -1]];
      piece.promotionRank = 9;
    } else {
      piece.MOVES = [[-1, 1], [-1, -1]];
      piece.promotionRank = 0;
    }
  }

  static updateValidMoves() {
    super.updateValidMoves();

    this.antikingSquares = []
  }
}

class EliteSoldier extends PieceMovingTwice {
  static ID = "es";
  static MOVES = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  constructor(board, row, col) {
    super(board, row, col);

    this.dog = null;
  }

  static preciseTransform(piece) {
    if (! piece instanceof EliteSoldier) {
      piece.dog = null;
    }
  }

  static capture(capturer) {
    let commands = super.capture(capturer);

    if (! this.dog) {return commands}  // happens when this is the phantom or a promoted pawn

    if (! this.dog.isCaptured) {
      commands.push(new Transform(this.dog, this.dog.actualClass, EnragedDog));  // enrage dog
    } else {
      commands.splice(commands.indexOf(commands.find(commandToRem => commandToRem.name === "transform")));  // remove leash phantomisation, stays dog
    }

    return commands;
  }

  static goTo(row, col) {
    let startRow = this.row, startCol = this.col;
    let commands = super.goTo(row, col);

    if (! this.dog) {return commands}  // happens when this is the phantom or a promoted pawn

    if (dogIsTooFar(this.row, this.col, this.dog.row, this.dog.col)) {
      commands.push(new AfterMove([this.dog.row, this.dog.col], getNewDogRC(startRow, startCol, this.row, this.col)));
    }

    return commands;
  }

  static updateValidMoves() {
    super.updateValidMoves();

    if (this.dog) {
      let squareToRemove = [this.dog.row, this.dog.col];
      this.antikingSquares = this.antikingSquares.filter(arr => JSON.stringify(arr) !== JSON.stringify(squareToRemove));
    }
  }
}

class Dog extends Piece {
  static ID = "d";

  constructor(board, row, col) {
    super(board, row, col);

    this.soldier = undefined;

    if (col > 3) {
      this.soldier = board.get(row, col - 1);
      this.soldier.dog = this;
    }
  }

  static capture(capturer) {
    let commands = super.capture(capturer);

    if (! this.soldier.isCaptured) {
      for (let command of commands) {
        if (command.name === "transform") {
          command.args[2] = EnragedDog  // a captured Dog creates an EnragedDog's phantom
        }
      }
      commands.push(new Capture(this.soldier, capturer));
    }

    return commands;
  }

  static goTo(row, col) {
    let startRow = this.row, startCol = this.col;
    let commands = super.goTo(row, col);

    if (dogIsTooFar(this.soldier.row, this.soldier.col, this.row, this.col)) {  // happens when pulled by the grapple
      commands.push(new AfterMove([this.soldier.row, this.soldier.col], getNewDogRC(startRow, startCol, this.row, this.col)));
    }
    return commands;
  }
}

class EnragedDog extends PieceMovingTwice {
  static ID = "ed";
  static MOVES = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
}

function dogIsTooFar(leashRow, leashCol, dogRow, dogCol) {
  return Math.abs(leashRow - dogRow) > 1 || Math.abs(leashCol - dogCol) > 1;
}

function getNewDogRC(leashStartRow, leashStartCol, leashEndRow, leashEndCol) {
  let deltaRow = normed(leashEndRow - leashStartRow);
  let deltaCol = normed(leashEndCol - leashStartCol);
  return [leashEndRow - deltaRow, leashEndCol - deltaCol];
}

function normed(x) {
  if (x < 0) {return -1} else if (x > 0) {return 1} else {return 0}
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
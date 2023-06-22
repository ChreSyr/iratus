
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
    let promotionWindow = document.getElementsByClassName("promotion-window")[0];
    let promotionPieces = document.getElementsByClassName("promotion-piece");
    for (let promotionPiece of promotionPieces) {
      promotionPiece.style.backgroundImage = "url('images/" + this.color + promotionPiece.classList[1] + ".png')"; 
    }
    if (this.color === "w") { // TODO : what if the board is flipped ?
      promotionWindow.classList.add("top");
    } else {
      promotionWindow.classList.remove("top");
    }
    promotionWindow.style.transform = `translateX(${this.col * 100}%)`;
    promotionWindow.style.visibility = "visible";
    promotionWindow.style.pointerEvents = "all";
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
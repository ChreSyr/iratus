
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
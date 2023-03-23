
class Game {

  constructor(boardClass) {

    this.board = new boardClass(this);

    this.movesHistory = [];
    this.backMovesHistory = [];  // for undone moves
    this.fatHistory = [];        // for positions

    this.turn = "w"  // white to move
    this.counter50rule = 0;  // draw if no capture or pawn move within 50 moves
    this.result = undefined;

    this.alwaysFlip = false;

    for (let piece of this.board.piecesColored[this.turn]) {
      piece.updateValidMoves();
    }

    this.fatHistory.push(this.board.getFatPosition());

    this.initDisplay();
  }

  checkForEnd() {
    let gameState = this.getGameState();
    let lastMove = this.movesHistory.slice(-1)[0];
    if (gameState === "checkmate") {
      lastMove.notation += "#";
    } else if (this.board.king[this.turn].inCheck()) {
      lastMove.notation += "+";
    }
    let ENDS = ["checkmate", "stalemate", "draw by repetition", "draw by insufficient material", "draw by 50-moves rule"]
    if (ENDS.includes(gameState)) {
      let description = "";
      if (gameState === "checkmate") {
        description = lastMove.turn === "b" ? "Black won" : "White won";
      }

      let infoDiv = document.getElementById("info");
      let titleLabel = infoDiv.getElementsByTagName("h2")[0];
      titleLabel.innerHTML = gameState[0].toUpperCase() + gameState.substring(1);
      let pieceImage = infoDiv.getElementsByTagName("img")[0];
      pieceImage.src = gameState === "checkmate" ? "images/" + lastMove.turn + lastMove.piece.ID + ".png" : "";
      let desriptionLabel = infoDiv.getElementsByTagName("p")[0];
      desriptionLabel.innerHTML = description;
      infoDiv.style.visibility = "visible";
      infoDiv.style.pointerEvents = "all";
    }
  }

  getGameState() {

    // draw by insufficient material
    let remainingPieces = {"w": [], "b": []};
    for (let piece of this.board.pieces) {
      if (! piece.isCaptured) {
        if (piece.ID === "k") {continue}
        remainingPieces[piece.color].push(piece);
      }
    }
    let knightOrBishop = ["n", "b"]
    function insufficient(set) {
      // NOTE : We could do sligthly more accurate draws
      // For example, if the two players still have a kniht, checkmate is still possible
      if (set.length === 0) {return true}
      if (set.length === 1) {return knightOrBishop.includes(set[0].ID)}
      if (set.length === 2) {return set[0].ID === set[1].ID}
      return false;
    }
    if (insufficient(remainingPieces["w"]) && insufficient(remainingPieces["b"])) {
      return "draw by insufficient material";
    }

    // draw by repetition
    if (this.fatHistory.length > 5) {
      let currentFatPosition = this.fatHistory.slice(-1)[0];
      let count = 1;
      for (let fatPosition of this.fatHistory) {
        if (currentFatPosition === fatPosition) {continue}
        if (currentFatPosition.equals(fatPosition)) {count += 1}
      }
      if (count === 3) {
        return "draw by repetition"
      }
    }

    for (let piece of this.board.piecesColored[this.turn]) {
      if (! piece.isCaptured && piece.validMoves.length) {

        // draw by 50-moves rule
        if (this.movesHistory && this.movesHistory.slice(-1)[0].counter50rule > 50) {
          return "draw by 50-moves rule";
        }

        // still at least 1 valid move
        return "keep going";
      }
    }

    // checkmate or stalemate
    return this.board.king[this.turn].inCheck() ? "checkmate" : "stalemate";
  }

  initDisplay() {
    
    const squares = document.getElementById("squares");
    const highlighters = document.getElementById("highlighters");
    const extracells = document.getElementById("extracells");
    const cells = document.getElementById("cells");

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.classList.add("square");
        square.dataset.row = row;
        square.dataset.col = col;
        squares.appendChild(square);
        
        const highlighter = document.createElement("div");
        highlighter.classList.add("highlighter");
        highlighter.dataset.row = row;
        highlighter.dataset.col = col;
        highlighters.appendChild(highlighter);
        highlighter.square = square;
        square.highlighter = highlighter;

        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.style.backgroundColor = "rgb(0, 0, 0, 0)";
        cell.highlighter = highlighter;
        highlighter.cell = cell;
        cells.appendChild(cell);
        square.cell = cell;
        
        const extracell = document.createElement("div");
        extracell.classList.add("extracell");
        extracell.dataset.row = row;
        extracell.dataset.col = col;
        extracells.appendChild(extracell);
        cell.extracell = extracell;
      } 
    }
    this.board.initDisplay();
  }

  move(start, end) {
    let piece = this.board.get(start[0], start[1]);
    let currentMove = this.board.move(start, end, true);
    this.movesHistory.push(currentMove);
    this.turn = currentMove.nextTurn;
    this.board.updateAllValidMoves();
    this.fatHistory.push(this.board.getFatPosition());
    this.backMovesHistory.length = 0;

    this.checkForEnd();

    if (this.alwaysFlip) {
      if (currentMove.turn !== currentMove.nextTurn) {
        this.board.flipDisplay(animate=false);
      }
    }
  }

  redo() {  // redo the last move

    if (this.backMovesHistory.length === 0) {return}

    let lastUndoneMove = this.backMovesHistory.pop(-1);

    this.board.redo(lastUndoneMove);
    this.movesHistory.push(lastUndoneMove);
    this.turn = lastUndoneMove.nextTurn;
    this.board.updateAllValidMoves();
    this.fatHistory.push(this.board.getFatPosition());

    if (this.alwaysFlip) {
      if (lastUndoneMove.turn !== lastUndoneMove.nextTurn) {
        this.board.flipDisplay(animate=false);
      }
    }
  }

  redoAll() {
    while (this.backMovesHistory.length) {
      this.redo();
    }
  }

  undo() {  // undo the last move
    if (this.movesHistory.length === 0) {return}

    let lastMove = this.movesHistory.pop(-1);
    this.backMovesHistory.push(lastMove);
    this.fatHistory.pop(-1);

    this.board.undo(lastMove);

    this.turn = lastMove.turn;
    this.board.updateAllValidMoves();
    
    if (this.alwaysFlip) {
      if (lastMove.turn !== lastMove.nextTurn) {
        this.board.flipDisplay(animate=false);
      }
    }
  }

  undoAll() {
    while (this.movesHistory.length) {
      this.undo();
    }
  }
}

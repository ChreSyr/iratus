// CONSTRUCTOR

function Game(boardClass) {
  this.board = boardClass;
  this.movesHistory = [];
  this.backMovesHistory = [];
  this.fenHistory = [];
  this.turn = "w";
  this.result = undefined;

  this.board = new boardClass(this);
  this.board.initDisplay();
  if (this.board.error) {
    return;
  }
  this.fenHistory.push(this.board.getFEN());
  this.board.updateAllValidMoves();
  this.updateDisplay();

  // PGN notation
  this.pgn = '[Variation "Iratus"]\n\n'; // TODO
}

// ROOT PROTOTYPE

Game.prototype = {
  checkForEnd: function () {
    let gameState = this.getGameState();
    let lastMove = this.movesHistory.slice(-1)[0];
    if (gameState === "checkmate") {
      lastMove.notation += "#";
    } else if (this.board.king[this.turn].inCheck()) {
      lastMove.notation += "+";
    }
    let ENDS = [
      "checkmate",
      "stalemate",
      "draw by repetition",
      "draw by insufficient material",
      "draw by 50-moves rule",
    ];
    let traductedENDS = {
      checkmate: "échec et mat",
      stalemate: "pat",
      "draw by repetition": "égalité par répétitions",
      "draw by insufficient material": "égalité par manque de matériel",
      "draw by 50-moves rule": "égalité par la règle des 50 coups",
    };
    if (ENDS.includes(gameState)) {
      let description = "";
      if (gameState === "checkmate") {
        description = lastMove.turn === "b" ? "Victoire des Noirs" : "Victoire des Blancs";
      }

      let infoDiv = document.getElementById("info");
      let titleLabel = infoDiv.getElementsByTagName("h2")[0];
      titleLabel.innerHTML =
        traductedENDS[gameState][0].toUpperCase() + traductedENDS[gameState].substring(1);
      let pieceImage = infoDiv.getElementsByTagName("img")[0];
      pieceImage.src =
        gameState === "checkmate" ? "images/" + lastMove.turn + lastMove.piece.ID + ".png" : "";
      let desriptionLabel = infoDiv.getElementsByTagName("p")[0];
      desriptionLabel.innerHTML = description;
      infoDiv.style.display = "flex";
    }
  },

  getGameState: function () {
    let remainingPieces = { w: [], b: [] };
    for (let piece of this.board.pieces) {
      if (!piece.isCaptured) {
        if (piece.ID === "k") {
          continue;
        }
        remainingPieces[piece.color].push(piece);
      }
    }

    let knightOrBishop = ["n", "b"];
    function insufficient(set) {
      if (set.length === 0) {
        return true;
      }
      if (set.length === 1) {
        return knightOrBishop.includes(set[0].ID);
      }
      if (set.length === 2) {
        return set[0].ID === set[1].ID;
      }
      return false;
    }

    if (insufficient(remainingPieces["w"]) && insufficient(remainingPieces["b"])) {
      return "draw by insufficient material";
    }

    if (this.fenHistory.length > 5) {
      let currentFEN = this.fenHistory.slice(-1)[0];
      let count = 1;
      for (let fenPosition of this.fenHistory) {
        if (currentFEN === fenPosition) {
          continue;
        }
        if (currentFEN.equals(fenPosition)) {
          count += 1;
        }
      }
      if (count === 3) {
        return "draw by repetition";
      }
    }

    for (let piece of this.board.piecesColored[this.turn]) {
      if (!piece.isCaptured && piece.validMoves.length) {
        if (this.movesHistory && this.movesHistory.slice(-1)[0].counter50rule > 100) {
          return "draw by 50-moves rule";
        }
        return "keep going";
      }
    }

    const currentKing = this.board.king[this.turn];
    return currentKing.posIsUnderCheck(currentKing.row, currentKing.col, (checkForMate = true))
      ? "checkmate"
      : "stalemate";
  },

  loadFEN: function (fen) {
    // Check validity
    if (!isValidFEN(fen)) {
      throw Error("Invalid FEN");
    }

    storage.setItem("fen", fen);
    location.href = "index.html#board-single";
    location.reload();
  },

  loadPGN: function (pgn) {
    throw Error("Invalid PGN");
  },

  move: function (start, end) {
    const currentMove = this.board.move(start, end, true);
    this.movesHistory.push(currentMove);
    if (this.board.pawnToPromote === null) {
      this.turn = currentMove.nextTurn;
      this.fenHistory.push(this.board.getFEN());
      this.backMovesHistory.length = 0;
      this.board.updateAllValidMoves();
      this.checkForEnd();
      this.updateDisplay();
    }
  },

  redo: function () {
    if (this.backMovesHistory.length === 0) {
      return;
    }

    const lastUndoneMove = this.backMovesHistory.pop(-1);

    this.board.redo(lastUndoneMove);
    this.movesHistory.push(lastUndoneMove);
    this.turn = lastUndoneMove.nextTurn;
    this.board.updateAllValidMoves();
    this.fenHistory.push(this.board.getFEN());
    this.updateDisplay();
  },

  redoAll: function () {
    while (this.backMovesHistory.length) {
      this.redo();
    }
  },

  undo: function () {
    if (this.movesHistory.length === 0) {
      return;
    }

    const lastMove = this.movesHistory.pop(-1);
    this.backMovesHistory.push(lastMove);
    this.fenHistory.pop(-1);
    this.board.undo(lastMove);
    this.turn = lastMove.turn;
    this.board.updateAllValidMoves();
    this.updateDisplay();
  },

  undoAll: function () {
    while (this.movesHistory.length) {
      this.undo();
    }
  },

  // INSTANCE METHODS - VIEW

  hasFlippedPieces: function () {
    var gameWrapper = document.getElementById("game-wrapper");
    return (
      gameWrapper.classList.contains("black-to-move") &&
      gameWrapper.classList.contains("rotation-pieces")
    );
  },

  isFlipped: function () {
    var gameWrapper = document.getElementById("game-wrapper");
    return (
      (gameWrapper.classList.contains("black-to-move") &&
        gameWrapper.classList.contains("rotation-board")) ||
      gameWrapper.classList.contains("rotation-black")
    );
  },

  updateDisplay: function () {
    // Update turn

    var gameWrapper = document.getElementById("game-wrapper");
    this.turn === "w"
      ? gameWrapper.classList.remove("black-to-move")
      : gameWrapper.classList.add("black-to-move");

    // Pieces imbalance

    const capturablesPattern = Object.keys(pieceClassesByID).slice(1, -1);
    capturablesPattern.sort(
      (id1, id2) => pieceClassesByID[id1].RELATIVE_VALUE - pieceClassesByID[id2].RELATIVE_VALUE
    );

    const getRemainingPieces = (color) => {
      return this.board.pieces
        .filter((piece) => !piece.isCaptured && piece.color === color)
        .map(
          (piece) =>
            (piece.cssClass === "phantom" ? Phantom.prototype.ID : piece.ID) +
            (piece.dynamited ? "y" : "")
        )
        .join("");
    };
    const remainingW = getRemainingPieces("w");
    const remainingB = getRemainingPieces("b");

    const removeCommonElements = (list1, list2) => {
      const frequencyMap = {};
      const result = [];

      // Count the frequency of elements in list1
      for (const element of list1) {
        frequencyMap[element] = (frequencyMap[element] || 0) + 1;
      }

      // Add elements to result if not present in list2 or still have remaining occurrences in list1
      for (const element of list2) {
        if (!frequencyMap[element]) {
          result.push(element);
        } else {
          frequencyMap[element]--;
        }
      }

      return result;
    };
    const imbalances = {
      b: removeCommonElements(remainingB, remainingW),
      w: removeCommonElements(remainingW, remainingB),
    };

    for (let color of ["w", "b"]) {
      var display = document.querySelector(".player-info." + color);
      display.innerHTML = "";
      let lastDisplayedPiece = null;

      const capturedPieces = imbalances[color];
      capturedPieces.relativeValue = 0;

      capturedPieces.sort(function (a, b) {
        return capturablesPattern.indexOf(a) - capturablesPattern.indexOf(b);
      });

      for (let capturedPiece of capturedPieces) {
        pieceDisplay = document.createElement("img");
        pieceDisplay.classList.add("captured-piece");
        pieceDisplay.classList.add(capturedPiece);
        if (lastDisplayedPiece !== capturedPiece) {
          pieceDisplay.classList.add("first");
        }
        lastDisplayedPiece = capturedPiece;
        pieceDisplay.src = "images/" + color + capturedPiece + ".png";
        display.appendChild(pieceDisplay);

        capturedPieces.relativeValue += pieceClassesByID[capturedPiece].RELATIVE_VALUE;
      }
    }

    const wAdvantage = imbalances["b"].relativeValue;
    const bAdvantage = imbalances["w"].relativeValue;
    const relativeAdvantage = Math.abs(wAdvantage - bAdvantage);
    let advantageColor;
    let advantageContainer;
    if (wAdvantage > bAdvantage) {
      advantageColor = "w";
      advantageContainer = document.querySelector(".player-info.b");
    } else if (bAdvantage > wAdvantage) {
      advantageColor = "b";
      advantageContainer = document.querySelector(".player-info.w");
    } // else there is material equality

    if (advantageColor) {
      advantageDisplay = document.createElement("p");
      advantageDisplay.classList.add("relative-advantage");
      advantageDisplay.innerText = "+" + relativeAdvantage;
      advantageContainer.appendChild(advantageDisplay);
    }

    // Update FEN
    const fenInput = document.getElementById("fen-input");
    fenInput.value = this.fenHistory.slice(-1)[0].fen;
    fenInput.classList.remove("invalid");
    // Disable import button
    fenInput.nextElementSibling.firstElementChild.disabled = true;
    // Save FEN
    // if (document.readyState === "complete") {
    //   storage.setItem("fen", fenInput.value);
    // }
  },
};

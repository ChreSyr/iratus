
class FatPositionClass {
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

// CONSTRUCTOR

function FatPosition(board, turn) {
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
  }
}
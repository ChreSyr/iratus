
class Board {

  NBRANKS = 10;
  static NBFILES = 8;

  _storage = {};

  add_piece(piece) {

  }

  set(piece, square) {
    this._storage[square] = piece;
  }

}
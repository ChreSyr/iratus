"use strict";

const NB_FILES: number = 8;
const NB_RANKS: number = 10;
const FILE_CHARACTERS: Array<string> = Array("a", "b", "c", "d", "e", "f", "g", "h");
const RANK_CHARACTERS: Array<string> = Array("10", "9", "8", "7", "6", "5", "4", "3", "2", "1");

/*
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

class Board {}

class UI_Piece {}

class Piece {

    LETTER: string;
    MOVES: Array<Array<number>>;
    #ATTR_TO_COPY: Array<string> = Array("LETTER",);
    #METH_TO_COPY: Array<string> = Array("copy", "go_to");

    board: Board;
    color: string;
    enemy_color: string;
    square: number;
    #is_captured: boolean = false;
    actual_class: string;

    #UI_CLASS: UI_Piece;

    constructor(board:Board, color:string, square:number) {

        this.board = board;
        this.color = color;
        this.square = square;

        if (color === "b") {
            this.enemy_color = "w";
        } else {
            this.enemy_color = "b";
        }

        this.actual_class = typeof this;
    }

    getCoordinates(): string {
        return FILE_CHARACTERS[this.getFile()] + RANK_CHARACTERS[this.getRank()]
    }

    getFile(): number {
        return Math.floor(this.square / 10);
    }

    getRank(): number {
        return this.square % 10;
    }
}

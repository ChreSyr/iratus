const fileDict = {
  0: "a",
  1: "b",
  2: "c",
  3: "d",
  4: "e",
  5: "f",
  6: "g",
  7: "h",
};

const inversedFileDict = {
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  e: 4,
  f: 5,
  g: 6,
  h: 7,
};

function dogIsTooFar(leashRow, leashCol, dogRow, dogCol) {
  return Math.abs(leashRow - dogRow) > 1 || Math.abs(leashCol - dogCol) > 1;
}

const getCoordFromRowCol = (row, col) => fileDict[col] + (9 - row);

const getRowColFromCoord = (coord) => [9 - parseInt(coord[1]), inversedFileDict[coord[0]]];

function getNewDogRC(leashStartRow, leashStartCol, leashEndRow, leashEndCol) {
  let deltaRow = normed(leashEndRow - leashStartRow);
  let deltaCol = normed(leashEndCol - leashStartCol);
  return [leashEndRow - deltaRow, leashEndCol - deltaCol];
}

function normed(x) {
  if (x < 0) {
    return -1;
  } else if (x > 0) {
    return 1;
  } else {
    return 0;
  }
}

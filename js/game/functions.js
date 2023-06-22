
const fileDict = {0:"a", 1:"b", 2:"c", 3:"d", 4:"e", 5:"f", 6:"g", 7:"h"}

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
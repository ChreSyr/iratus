

lis = [ [1, 2], [3, 4], [5, 6], [7, 8], [9, 10] ]

const array2D = [
  [1, 2],
  [3, 4],
  [5, 6],
  [7, 8]
];

const arrayToRemove = [4, 4]; // remove the array [3, 4]

const newArray2D = array2D.filter(arr => JSON.stringify(arr) !== JSON.stringify(arrayToRemove));

console.log(newArray2D); // output: [[1, 2], [5, 6], [7, 8]]
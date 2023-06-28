
// Handle when an option is selected in the style <select>
function handleExperimentalSelect(type) {
  var selectedOption = document.getElementById("select-" + type).value;
  document.getElementById('custom-' + type).setAttribute('href', 'css/experiments/' + type + '-' + selectedOption + '.css');
}

// Open ko-fi.com in a new web page
function openKoFi() {
  window.open('https://ko-fi.com/chresyr', '_blank');
}

// Open chess.com's learn page in a new web page
function openLearnChess() {
  window.open('https://www.chess.com/fr/learn-how-to-play-chess', '_blank');
}
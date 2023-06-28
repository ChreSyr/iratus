

// Close the menu's bar on mobile view
function closeMenu() {
  document.getElementsByClassName("menu-bar-wrapper")[0].classList.add("closed-for-mobile")
}

// Handle when an option is selected in the style <select>
function handleExperimentalSelect(type) {
  var selectedOption = document.getElementById("select-" + type).value;
  try {
    document.getElementById('custom-' + type).setAttribute('href', 'css/experiments/' + type + '-' + selectedOption + '.css');
  } catch (error) {
    // file not found
  }
}

// Open ko-fi.com in a new web page
function openKoFi() {
  window.open('https://ko-fi.com/chresyr', '_blank');
}

// Open chess.com's learn page in a new web page
function openLearnChess() {
  window.open('https://www.chess.com/fr/learn-how-to-play-chess', '_blank');
}

// Open the menu's bar on mobile view
function openMenu() {
  document.getElementsByClassName("menu-bar-wrapper")[0].classList.remove("closed-for-mobile")
}
// Handle when an option is selected in the style <select>
function handleExperimentalSelect(type) {
  var selectedOption = document.getElementById("select-" + type).value;
  try {
    document
      .getElementById("custom-" + type)
      .setAttribute("href", "css/experiments/" + type + "-" + selectedOption + ".css");
  } catch (error) {
    // file not found
  }
}

// Return true if the user is using a mobile
function isMobileDevice() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

// Open ko-fi.com in a new web page
function openKoFi() {
  window.open("https://ko-fi.com/chresyr", "_blank");
}

// Open chess.com's learn page in a new web page
function openLearnChess() {
  window.open("https://www.chess.com/fr/learn-how-to-play-chess", "_blank");
}

/* Supports pointer events */
// Old browsers don't support pointer events
const supportsPointerEvents = window.PointerEvent !== undefined;

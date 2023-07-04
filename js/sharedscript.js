// Handle when an option is selected in the style <select>
function handleExperimentalSelect(type) {
  var selectedOption = document.getElementById("select-" + type).value;
  try {
    document
      .getElementById("custom-" + type)
      .setAttribute(
        "href",
        "css/experiments/" + type + "-" + selectedOption + ".css"
      );
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
const supportsPointerEvents = window.PointerEvent !== undefined;
/* User is on a mobile device */
// const isMobileDevice = /Mobi|Android/i.test(navigator.userAgent);
// /* is-mobile-device css property */
// document.documentElement.style.setProperty(
//   "--is-mobile-device",
//   isMobileDevice
// );

/* New rules buttons always visible on mobile */
if (isMobileDevice()) {
  document
    .getElementsByClassName("iratusrules-wrapper")[0]
    .classList.add("always-open-for-mobile");
}

/* Square size - defined here because used by menu-panel*/
function ajustSquareSize() {
  // Change the property squareSize depending on screen size

  // var screenWidth = screen.width;
  // var screenHeight = screen.height;

  // console.log("Screen Width: " + screenWidth);
  // console.log("Screen Height: " + screenHeight);

  // var windowWidth = window.innerWidth;
  // var windowHeight = window.innerHeight;

  // console.log("Window Width: " + windowWidth);
  // console.log("Window Height: " + windowHeight);

  // var clientWidth = document.body.clientWidth;
  // var clientHeight = document.body.clientHeight;

  // console.log("Document Width: " + clientWidth);
  // console.log("Document Height: " + clientHeight);

  var clientWidth = document.firstElementChild.clientWidth;
  var clientHeight = document.firstElementChild.clientHeight;

  // console.log("HTML Width: " + clientWidth);
  // console.log("HTML Height: " + clientHeight);

  var rootFontSize = window.getComputedStyle(document.documentElement).fontSize;
  var fontSizeValue = parseFloat(rootFontSize);
  // console.log("Root Font Size Value: " + fontSizeValue);

  // availible space for the baord and the players info
  var availibleWidth = clientWidth - fontSizeValue * 2;
  if (clientWidth < 1024) {
    var availibleHeight =
      clientHeight - fontSizeValue * (1 + 4 + 1 + 1 + 4 + 1 + 6 + 1);
  } else {
    var availibleHeight =
      clientHeight - fontSizeValue * (1 + 4 + 1 + 1 + 4 + 1);
  }

  // console.log("Availible Width: " + availibleWidth);
  // console.log("Availible Height: " + availibleHeight);

  if (isMobileDevice()) {
    var squareSize = Math.floor(availibleWidth / 8);
  } else {
    var squareSize = Math.floor(
      Math.min(availibleWidth / 8, availibleHeight / 10)
    );
  }

  // we switch to desktop view at MAX * 8 + body.padding * 2 + header.width = 68 * 8 + 10 * 2 + 50 = 614px
  squareSize = Math.min(squareSize, 68); // No more than 68

  // console.log("Square Size: " + squareSize);

  document.documentElement.style.setProperty(
    "--square-size",
    squareSize + "px"
  );
}
ajustSquareSize();
window.addEventListener("resize", ajustSquareSize);

/* Close menu when clicked outside */
// function handlePointerDown(event) {
//   if (!document.getElementById("menu-wrapper").contains(event.target)) {
//     closeMenu();
//   }
// }
// document.addEventListener(
//   supportsPointerEvents ? "pointerdown" : "mousedown",
//   handlePointerDown
// );

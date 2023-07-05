/* MENU WRAPPER */

const menuWrapper = document.getElementById("menu-wrapper");

menuWrapper.addEventListener("click", (event) => {
  // event.preventDefault();
  console.log("menu wrapper click");
});

menuWrapper.addEventListener("focusout", (event) => {
  if (devMode) {
    return;
  } // for a simpler debugging

  if (event.currentTarget.contains(event.relatedTarget)) {
    /* Focus will still be within the container */
  } else {
    /* Focus will leave the container */
    closeMenu();
  }
});

// TODO : an overlay over the website when the menu is open, to prevent any interaction with it when leaving the menu

/* MENU BAR WRAPPER */

const menuBarWrapper = document.getElementById("menu-bar-wrapper");

function openMenu() {
  menuBarWrapper.classList.remove("closed-for-mobile");
}

function closeMenu() {
  menuBarWrapper.classList.add("closed-for-mobile");
  for (let selectedPanel of document.getElementsByClassName("selected-panel")) {
    selectedPanel.classList.remove("selected-panel");
  }
}

/* MENU PANEL WRAPPER */

// Open new page from menu-bar's btn
function clickMenuBarBtn(type) {}

const menuPanelWrappers = document.getElementsByClassName("menu-panel-wrapper");

for (let menuPanelWrapper of menuPanelWrappers) {
  switch (menuPanelWrapper.id) {
    case "menu-panel-wrapper-close":
      break;
    case "menu-panel-wrapper-iratus":
      menuPanelWrapper.addEventListener("click", (event) => {
        window.location.href = "index.html"; // TODO : plus propre ?
      });
      break;
    case "menu-panel-wrapper-rules":
    case "menu-panel-wrapper-puzzles":
    case "menu-panel-wrapper-contact":
    case "menu-panel-wrapper-donations":
    case "menu-panel-wrapper-settings":
      menuPanelWrapper.addEventListener("click", (event) => {
        menuPanelWrapper.classList.add("selected-panel");
      });
      menuPanelWrapper.addEventListener("focusout", (event) => {
        if (devMode) {
          return;
        } // for a simpler debugging

        if (!event.currentTarget.contains(event.relatedTarget)) {
          /* Focus will leave the container */
          menuPanelWrapper.classList.remove("selected-panel");
        }
      });
      break;
  }
}

/* MENU BAR BUTTON */

const menuBarButtons = document.getElementsByClassName("menu-bar-btn");

for (let menuBarButton of menuBarButtons) {
  switch (menuBarButton.id) {
    case "menu-bar-btn-hamburger":
      menuBarButton.addEventListener("click", openMenu);
      break;
    case "menu-bar-btn-close":
      menuBarButton.addEventListener("click", closeMenu);
      break;
    case "menu-bar-btn-rules":
    case "menu-bar-btn-puzzles":
    case "menu-bar-btn-contact":
    case "menu-bar-btn-donations":
    case "menu-bar-btn-settings":
      const buttonName = menuBarButton.id.split("-")[3];
      menuBarButton.addEventListener("click", (event) => {
        event.stopPropagation(); // prevents wrapper to open again
        clickMenuBarBtn(buttonName); // TODO : import here

        if (
          document.firstElementChild.clientWidth >= 614 &&
          !isMobileDevice()
        ) {
          switch (buttonName) {
            case "rules":
            case "puzzles":
            case "contact":
              window.location.href = buttonName + ".html";
              break;
            case "donations":
              // Open ko-fi.com in a new web page
              openKoFi();
          }
          return;
        }

        for (let panelWrapper of document.getElementsByClassName(
          "menu-panel-wrapper"
        )) {
          if (panelWrapper.id.split("-")[3] === buttonName) {
            panelWrapper.classList.toggle("selected-panel");
          } else {
            panelWrapper.classList.remove("selected-panel");
          }
        }
      });
      break;
  }
}

/* SETTINGS SWITCH - TODO : finish */

/* Local storage */
// Check the user's preference from localStorage on page load
window.addEventListener("DOMContentLoaded", function () {
  const body = document.body;

  const preferredTheme = localStorage.getItem("theme");
  if (preferredTheme === "light") {
    body.classList.add("light-mode");
    document.getElementById("toggle-dark-mode").checked = false;
  } else {
    body.classList.remove("light-mode"); // Remove the light mode class if not set
    document.getElementById("toggle-dark-mode").checked = true;
  }

  const preferredReading = localStorage.getItem("easy-reading");
  if (preferredReading === "yes") {
    body.classList.add("easy-reading");
    document.getElementById("toggle-easy-reading").checked = true;
  } else {
    body.classList.remove("easy-reading");
    document.getElementById("toggle-easy-reading").checked = false;
  }
});

const menuSettings = document.getElementById("menu-panel-wrapper-settings");
const menuSettingsInputs = menuSettings.querySelectorAll("input");

menuSettingsInputs.forEach((input) => {
  switch (input.id) {
    case "toggle-dark-mode":
      input.addEventListener("change", (event) => {
        // Change the theme
        const body = document.body;
        body.classList.toggle("light-mode");
        body.classList.add("animating-dark-mode");

        // Store the theme
        const isLightMode = body.classList.contains("light-mode");
        localStorage.setItem("theme", isLightMode ? "light" : "dark");
      });
      break;
  }
});

/* Light / Dark mode */
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle("light-mode");
  // body.classList.add("animating-dark-mode");

  // Store the user's preference in localStorage
  const isLightMode = body.classList.contains("light-mode");
  localStorage.setItem("theme", isLightMode ? "light" : "dark");
}
// const switchDarkMode = document.getElementById("toggle-dark-mode");
// switchDarkMode.addEventListener("change", toggleDarkMode);

// function handleAnimationEnd() {
//   document.body.classList.remove("animating-dark-mode");
// }
// document
//   .getElementsByClassName("settings")[0]
//   .addEventListener("transitionend", handleAnimationEnd);

/* Easy Reading */
function toggleEasyReading() {
  const body = document.body;
  body.classList.toggle("easy-reading");

  // Store the user's preference in localStorage
  const isEasyReading = body.classList.contains("easy-reading");
  localStorage.setItem("easy-reading", isEasyReading ? "yes" : "no");
}
const switchReading = document.getElementById("toggle-easy-reading");
switchReading.addEventListener("change", toggleEasyReading);

/* Developer Mode */
let devMode = false;
function toggleDeveloperMode() {
  devMode = !devMode;
}
const switchDeveloper = document.getElementById("toggle-developer-mode");
switchDeveloper.addEventListener("change", toggleDeveloperMode);

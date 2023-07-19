/* ERRORS & LOGS PRINTED IN-WEB */
if (true) {
  /* ERRORS */

  window.onerror = function (message, source, lineno, colno, error) {
    // Get the error details
    var errorDetails = {
      message: message,
      source: source,
      lineNumber: lineno,
      columnNumber: colno,
      error: error,
    };

    // Append the error information to the error container
    appendErrorToContainer(errorDetails);
  };

  function appendErrorToContainer(errorDetails) {
    var errorContainer = document.getElementById("errors-container");
    var errorMessage = document.createElement("div");
    errorMessage.classList.add("accordion-content");
    errorMessage.textContent = errorDetails.message;
    errorContainer.appendChild(errorMessage);

    // if open, increase errorContainer's height
    if (errorContainer.previousElementSibling.classList.contains("active")) {
      errorContainer.style.maxHeight = errorContainer.scrollHeight + "px";
    }
  }

  /* LOGS */

  // Save the reference to the original console.log function
  var originalLog = console.log;

  // Override console.log to capture and display the logs
  console.log = function () {
    // Get the log arguments and convert them to a string
    var logMessage = Array.from(arguments)
      .map(function (arg) {
        return typeof arg === "object" ? JSON.stringify(arg) : arg;
      })
      .join(" ");

    // Append the log message to the log container
    appendLogToContainer(logMessage);

    // Call the original console.log function
    originalLog.apply(console, arguments);
  };

  function appendLogToContainer(logMessage) {
    var logContainer = document.getElementById("logs-container");
    var logEntry = document.createElement("p");
    logEntry.textContent = logMessage;
    logContainer.appendChild(logEntry);

    // if open, increase logContainer's height
    // if (logContainer.previousElementSibling.classList.contains("active")) {
    //   logContainer.style.maxHeight = logContainer.scrollHeight + "px";
    // }
  }
}

// Version
const version = "0.13.6";
const versionLabel = document.getElementById("version-label");
versionLabel.textContent = "Version : " + version;

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

// Accordion
// Show / hide accordion-content when click on -accordion-btn
var accordionTriggers = document.getElementsByClassName("accordion-btn");
for (let accordionTrigger of accordionTriggers) {
  accordionTrigger.addEventListener("click", function () {
    this.classList.toggle("active");

    var panel = this.nextElementSibling;
    if (this.classList.contains("active")) {
      panel.style.maxHeight = panel.scrollHeight + "px";
    } else {
      panel.style.maxHeight = null;
    }
  });
}
if ("ResizeObserver" in window) {
  // Update accordion-panel's height when accordion-content's height changes
  var accordionContents = document.getElementsByClassName("accordion-content");
  for (let accordionContent of accordionContents) {
    const resizeObserver = new ResizeObserver((entries) => {
      if (accordionContent.parentElement.previousElementSibling.classList.contains("active")) {
        const accordionPanel = accordionContent.parentElement;
        accordionPanel.style.maxHeight = accordionPanel.scrollHeight + "px";
      }
    });
    resizeObserver.observe(accordionContent);
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
const pointerdown = supportsPointerEvents ? "pointerdown" : "touchstart";
const pointermove = supportsPointerEvents ? "pointermove" : "touchmove";
const pointerup = supportsPointerEvents ? "pointerup" : "touchend";
const pointercancel = supportsPointerEvents ? "pointercancel" : "touchcancel";

// local storage
storage = { content: [] };
storage.addPageLoadListener = (itemName, onDOMContentLoaded) => {
  storage.content.push({ itemName, onDOMContentLoaded });
};
storage.getItem = (key) => {
  return localStorage.getItem(key);
};
storage.setItem = (key, value) => {
  localStorage.setItem(key, value);
};
// on page load
window.addEventListener("DOMContentLoaded", function () {
  for (const stored of storage.content) {
    const item = this.localStorage.getItem(stored.itemName);
    stored.onDOMContentLoaded(item);
  }
});

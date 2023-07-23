setPiecesStyle();
const boardDiv = document.getElementById("board-single");

/* GAME TOOLS */

// SETTINGS

var gameWrapper = document.getElementById("game-wrapper");

// Select Rotation
const selectRotation = document.getElementById("select-rotation");

const updateRotation = () => {
  for (let option of selectRotation.options) {
    gameWrapper.classList.remove("rotation-" + option.value);
  }
  if (selectRotation.value !== "no") {
    gameWrapper.classList.add("rotation-" + selectRotation.value);
  }
};

selectRotation.addEventListener("change", (event) => {
  updateRotation();

  // Store the choice
  storage.setItem("rotation", selectRotation.value);
});

storage.addPageLoadListener("rotation", (item) => {
  if (item === null) {
    return;
  } // no item found in storage

  selectRotation.value = item;
  updateRotation();
});

// Inputs
const indexSettingsInputs = document.querySelectorAll(".tools-wrapper input");

indexSettingsInputs.forEach((input) => {
  switch (input.id) {
    case "toggle-animations":
      const updateAnimations = () => {
        if (input.checked) {
          boardDiv.classList.add("animated");
        } else {
          boardDiv.classList.remove("animated");
        }
      };

      input.addEventListener("change", (event) => {
        updateAnimations();

        // Store the choice
        storage.setItem("animate-pieces", input.checked ? "yes" : "no");
      });

      storage.addPageLoadListener("animate-pieces", (item) => {
        if (item === null) {
          return;
        } // no item found in storage

        // item can be "yes" or "no"
        input.checked = item === "yes";
        updateAnimations();
      });
      break;

    case "toggle-coords":
      const coords = document.querySelector("svg.coordinates");

      const updateCoords = () => {
        if (input.checked) {
          coords.classList.remove("hidden");
          boardDiv.style.setProperty("--coords-margin", "0.3");
        } else {
          coords.classList.add("hidden");
          boardDiv.style.setProperty("--coords-margin", "0");
        }
      };

      input.addEventListener("change", (event) => {
        updateCoords();

        // Store the choice
        storage.setItem("show-coords", input.checked ? "yes" : "no");
      });

      storage.addPageLoadListener("show-coords", (item) => {
        if (item === null) {
          return;
        } // no item found in storage

        // item can be "yes" or "no"
        input.checked = item === "yes";
        updateCoords();
      });
      break;
  }
});

// IMPORT EXPORT

// Dynamic layout of tools-wrapper
const toolsWrapper = document.querySelector(".tools-wrapper");
function adjustToolsWrapper() {
  if (document.body.clientWidth - boardDiv.offsetWidth >= 430) {
    toolsWrapper.style.width = `${400}px`;
    toolsWrapper.classList.add("at-right");
  } else {
    toolsWrapper.style.width = "100%";
    toolsWrapper.classList.remove("at-right");
  }
}
adjustToolsWrapper();
window.addEventListener("resize", adjustToolsWrapper);

// FEN Input
const fenInput = document.getElementById("fen-input");
fenInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.keyCode === 13) {
    fenInput.blur(); // Release the focus from the input
  }
});

// PGN Input
const pgnInput = document.getElementById("pgn-input");
// pgnInput.value = game.pgn;

// Automatically ajust heights
fenInput.style.height = fenInput.scrollHeight + "px";
pgnInput.style.height = pgnInput.scrollHeight + 2 + "px";

// Enabling import button
fenInput.addEventListener("input", (event) => {
  fenInput.classList.remove("invalid");
  // fenInput.nextElementSibling.firstElementChild = import button
  fenInput.nextElementSibling.firstElementChild.disabled =
    fenInput.value === game.fenHistory.slice(-1)[0].fen;
});
pgnInput.addEventListener("input", (event) => {
  pgnInput.style.height = "0px";
  pgnInput.style.height = pgnInput.scrollHeight + 2 + "px";

  pgnInput.classList.remove("invalid");
  // pgnInput.nextElementSibling.firstElementChild = import button
  pgnInput.nextElementSibling.firstElementChild.disabled = pgnInput.value === game.pgn;
});

// Import / Export buttons
for (let input of [fenInput, pgnInput]) {
  const importBtn = input.nextElementSibling.firstElementChild;
  importBtn.addEventListener("click", (event) => {
    try {
      if (input === fenInput) {
        game.loadFEN(input.value);
      } else {
        game.loadPGN(input.value);
      }
    } catch (error) {
      console.log(error.message);
      input.classList.add("invalid");
    }
  });
  const resetBtn = importBtn.nextElementSibling;
  resetBtn.addEventListener("click", (event) => {
    if (input === fenInput) {
      game.loadFEN(IratusBoard.emptyFEN);
    } else {
      game.loadPGN(Game.emptyPGN); // TODO
    }
  });
  const exportBtn = resetBtn.nextElementSibling;
  exportBtn.addEventListener("click", (event) => {
    navigator.clipboard
      .writeText(input.value)
      .then(() => {
        const originalTextContent = exportBtn.textContent;
        exportBtn.textContent = "Copié";
        setTimeout(() => {
          exportBtn.textContent = originalTextContent;
        }, 2000);
      })
      .catch((error) => {
        console.error("Failed to copy text:", input.value);
      });
  });
}

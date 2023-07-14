setPiecesStyle();
const boardDiv = document.getElementById("board-single");

/* GAME TOOLS */

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

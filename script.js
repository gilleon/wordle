const grid = document.getElementById("grid");
const message = document.getElementById("message");
let currentRow = 0;
let currentGuess = "";
let answer = "";
let allowedWords = [];
let gameOver = false;

// Fetch the word list and choose the answer
fetch("https://wordle-api.up.railway.app/words")
  .then((response) => response.json())
  .then((data) => {
    const words = data.answers;
    answer = words[Math.floor(Math.random() * words.length)].toUpperCase();
    console.log(`Answer for debugging: ${answer}`);
  });

// Create dynamically
for (let i = 0; i < 6; i++) {
  for (let j = 0; j < 5; j++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.id = `row-${i}-tile-${j}`;
    grid.appendChild(tile);
  }
}

document.addEventListener("keydown", handleKeyPress);

function handleKeyPress(e) {
  if (gameOver) return;

  if (e.key >= "a" && e.key <= "z" && currentGuess.length < 5) {
    currentGuess += e.key.toUpperCase();
    updateGrid();
  } else if (e.key === "Backspace" && currentGuess.length > 0) {
    currentGuess = currentGuess.slice(0, -1);
    updateGrid();
  } else if (e.key === "Enter" && currentGuess.length === 5) {
    if (isValidWord(currentGuess)) {
      checkGuess();
    } else {
      handleInvalidGuess();
    }
  }
}

function updateGrid() {
  for (let i = 0; i < 5; i++) {
    const tile = document.getElementById(`row-${currentRow}-tile-${i}`);
    tile.textContent = currentGuess[i] || "";
  }
}

// Fetch the dictionary words from the API
function getDictionary() {
  fetch("https://wordle-api.up.railway.app/words")
    .then((response) => response.json())
    .then((data) => {
      allowedWords = [...data.allowed, ...data.answers];
    })
    .catch((error) => {
      console.error("Error fetching dictionary:", error);
    });
}

// Call getDictionary to load words when the game starts
getDictionary();

// Function to check if the current guess is valid
function isValidWord(word) {
  return allowedWords.includes(word.toLowerCase());
}

// Function to handle an invalid guess
function handleInvalidGuess() {
  setMessage("Invalid word, please try again!");
  clearCurrentGuessTiles();
  currentGuess = "";
}

// Function to handle guess submission
function checkGuess() {
  if (currentGuess.toUpperCase() === answer) {
    setMessage("You win! 🎉");
    highlightRow(currentRow, "correct");
    gameOver = true;
    return;
  }

  if (currentRow >= 5) {
    setMessage(`You lose! The word was ${answer}`);
    gameOver = true;
    return;
  }

  validateGuess();
  currentRow++;
  currentGuess = "";
  setMessage(`Try again! ${6 - currentRow} guesses left.`);
}

// Function to validate the guess and update tile colors
function validateGuess() {
  const guessArray = currentGuess.split("");
  const answerArray = answer.split("");

  // Correct word in sequence
  const correctPositions = new Array(5).fill(false);
  const answerArrayCopy = [...answerArray];
  for (let i = 0; i < 5; i++) {
    const tile = document.getElementById(`row-${currentRow}-tile-${i}`);
    if (guessArray[i] === answerArrayCopy[i]) {
      tile.classList.add("correct");
      correctPositions[i] = true;
      answerArrayCopy[i] = null;
      guessArray[i] = null;
    }
  }

  // Handle word present otherwise absent
  for (let i = 0; i < 5; i++) {
    const tile = document.getElementById(`row-${currentRow}-tile-${i}`);
    if (!tile.classList.contains("correct")) {
      const guessedLetter = guessArray[i];
      if (guessedLetter && answerArrayCopy.includes(guessedLetter)) {
        tile.classList.add("present");
        answerArrayCopy[answerArrayCopy.indexOf(guessedLetter)] = null;
      } else {
        tile.classList.add("absent");
      }
    }
  }
}

// Function to clear the tiles
function clearCurrentGuessTiles() {
  for (let i = 0; i < 5; i++) {
    const tile = document.getElementById(`row-${currentRow}-tile-${i}`);
    tile.textContent = "";
  }
}

function highlightRow(row, className) {
  for (let i = 0; i < 5; i++) {
    document.getElementById(`row-${row}-tile-${i}`).classList.add(className);
  }
}

function setMessage(msg) {
  message.textContent = msg;
}

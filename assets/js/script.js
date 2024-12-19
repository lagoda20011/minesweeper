function retryGame() {
  document.getElementById("message").style.display = "none";
  document.getElementById("retryButton").style.display = "none";
  document.getElementById("game").style.display = "none";

  document.getElementById("play-btn").style.display = "inline-block";
  document.getElementById("difficulty").disabled = false;

  document.getElementById("message").textContent = "";
  document.getElementById("game").innerHTML = "";
  currentGame = null;
}

function startNewGame() {
  document.getElementById("play-btn").style.display = "none";

  setLevel();

  document.getElementById("game").style.display = "flex";
  document.getElementById("difficulty").disabled = true;
}

function toggleInstruction() {
  const instruction = document.getElementById("instruction");
  event.stopPropagation();

  if (instruction.style.display === "flex") {
    instruction.style.display = "none";
    console.log("Instruction - Closed");
  } else {
    instruction.style.display = "flex";
    console.log("Instruction - Opened");
  }
}

document.addEventListener("click", (event) => {
  const instruction = document.getElementById("instruction");

  if (instruction.style.display === "flex") {
    instruction.style.display = "none";
    console.log("Instruction - Closed (outside click)");
  }
});

document.getElementById("text-wrapper").addEventListener("click", (event) => {
  event.stopPropagation();
});

const LEVELS = {
  easy: { rows: 8, cols: 8, mines: 10 },
  normal: { rows: 10, cols: 10, mines: 20 },
  hard: { rows: 15, cols: 15, mines: 40 },
  expert: { rows: 20, cols: 20, mines: 60 },
};

let currentGame;

function setLevel() {
  const level = document.getElementById("difficulty").value;
  const { rows, cols, mines } = LEVELS[level];
  currentGame = new Minesweeper(rows, cols, mines);
}

function showGame(firstElement, secondElement, thirdElement) {
  var elementToHide = document.getElementById(firstElement);
  var elementToShow = document.getElementById(secondElement);
  var elementToBlock = document.getElementById(thirdElement);

  elementToHide.style.display = "none";
  elementToShow.style.display = "flex";
  elementToBlock.disabled = true;
}

class Minesweeper {
  constructor(rows, cols, mines) {
    this.rows = rows;
    this.cols = cols;
    this.mines = mines;
    this.board = [];
    this.unrevealedCells = rows * cols - mines;
    this.generateBoard();
    this.placeMines();
    this.calculateNumbers();
    this.render();
  }

  generateBoard() {
    this.board = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => ({
        mine: false,
        revealed: false,
        flagged: false,
        number: 0,
      }))
    );
  }

  placeMines() {
    let placedMines = 0;
    while (placedMines < this.mines) {
      const row = Math.floor(Math.random() * this.rows);
      const col = Math.floor(Math.random() * this.cols);
      if (!this.board[row][col].mine) {
        this.board[row][col].mine = true;
        placedMines++;
      }
    }
  }

  calculateNumbers() {
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.board[row][col].mine) continue;

        let count = 0;
        directions.forEach(([dr, dc]) => {
          const newRow = row + dr;
          const newCol = col + dc;
          if (
            newRow >= 0 &&
            newRow < this.rows &&
            newCol >= 0 &&
            newCol < this.cols &&
            this.board[newRow][newCol].mine
          ) {
            count++;
          }
        });
        this.board[row][col].number = count;
      }
    }
  }

  revealCell(row, col) {
    const cell = this.board[row][col];
    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;
    this.unrevealedCells--;

    if (cell.mine) {
      var message = document.getElementById("message");
      message.style.display = "flex";
      message.style.color = "red";
      message.style.fontWeight = "bolder";
      message.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.6)";
      message.textContent = "Game Over!:(";

      this.revealAll();
      document.getElementById("retryButton").style.display = "inline-block";
      return;
    }

    if (cell.number === 0) {
      this.floodFill(row, col);
    }

    if (this.unrevealedCells === 0) {
      var message = document.getElementById("message");
      message.style.display = "flex";
      message.style.color = "green";
      message.style.fontWeight = "bolder";
      message.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.6)";
      message.textContent = "You win!";

      this.revealAll();
    }

    this.render();
  }

  floodFill(row, col) {
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    directions.forEach(([dr, dc]) => {
      const newRow = row + dr;
      const newCol = col + dc;
      if (
        newRow >= 0 &&
        newRow < this.rows &&
        newCol >= 0 &&
        newCol < this.cols &&
        !this.board[newRow][newCol].revealed
      ) {
        this.revealCell(newRow, newCol);
      }
    });
  }

  toggleFlag(row, col) {
    const cell = this.board[row][col];
    if (cell.revealed) return;

    cell.flagged = !cell.flagged;
    this.render();
  }

  revealAll() {
    this.board.forEach((row) => row.forEach((cell) => (cell.revealed = true)));
    this.render();
  }

  render() {
    const game = document.getElementById("game");
    game.innerHTML = "";

    const boardElement = document.createElement("div");
    boardElement.className = "board";
    boardElement.style.gridTemplateRows = `repeat(${this.rows}, 30px)`;
    boardElement.style.gridTemplateColumns = `repeat(${this.cols}, 30px)`;

    this.board.forEach((row, r) => {
      row.forEach((cell, c) => {
        const cellElement = document.createElement("div");
        cellElement.className = "cell";

        if (cell.revealed) {
          cellElement.classList.add("revealed");
          if (cell.mine) {
            cellElement.classList.add("mine");
          } else if (cell.number > 0) {
            cellElement.textContent = cell.number;

            switch (cell.number) {
              case 1:
                cellElement.style.color = "blue";
                cellElement.style.fontWeight = "bolder";
                break;
              case 2:
                cellElement.style.color = "green";
                cellElement.style.fontWeight = "bolder";
                break;
              case 3:
                cellElement.style.color = "red";
                cellElement.style.fontWeight = "bolder";
                break;
              case 4:
                cellElement.style.color = "darkblue";
                cellElement.style.fontWeight = "bolder";
                break;
              case 5:
                cellElement.style.color = "darkred";
                cellElement.style.fontWeight = "bolder";
                break;
              default:
                break;
            }
          }
        } else if (cell.flagged) {
          cellElement.classList.add("flag");
        }

        cellElement.addEventListener("click", () => this.revealCell(r, c));
        cellElement.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          this.toggleFlag(r, c);
        });

        boardElement.appendChild(cellElement);
      });
    });

    game.appendChild(boardElement);
  }
}

setLevel();

"use strict";

    /* ---------- TAB NAVIGATION ---------- */
    function openTab(evt, tabName) {
      const tabcontents = document.getElementsByClassName("tabcontent");
      for (let i = 0; i < tabcontents.length; i++) {
        tabcontents[i].style.display = "none";
        tabcontents[i].classList.remove("active");
      }
      const tablinks = document.getElementsByClassName("tablinks");
      for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
      }
      document.getElementById(tabName).style.display = "block";
      document.getElementById(tabName).classList.add("active");
      evt.currentTarget.classList.add("active");
      if (tabName === "recordsTab") loadRecords();
    }
    document.getElementById("defaultTab").click();

    /* ---------- Global Game Variables ---------- */
    let board = [];
    let dimension = 3; // default: 3x3 puzzle
    let moveCount = 0;
    let score = 0;
    let correctMoves = 0;
    let errors = 0;
    const MAX_ERRORS = 5;

    const boardContainer = document.getElementById("boardContainer");

    /* ---------- Initialize Board ---------- */
    function initBoard() {
      // Set board dimension based on selection.
      dimension = parseInt(document.getElementById("puzzleSize").value);
      // Create a solved board: numbers 1..(n*n - 1) then 0 for blank.
      board = [];
      for (let i = 1; i < dimension * dimension; i++) {
        board.push(i);
      }
      board.push(0); // empty cell
      moveCount = 0;
      score = 0;
      correctMoves = 0;
      errors = 0;
      document.getElementById("scoreDisplay").innerText = score;
      document.getElementById("correctDisplay").innerText = correctMoves;
      document.getElementById("errorDisplay").innerText = errors;
      document.getElementById("moveCount").innerText = moveCount;
      document.getElementById("message").innerText = "";
      renderBoard();
    }

    /* ---------- Render Board ---------- */
    function renderBoard() {
      // Set grid CSS based on dimension.
      boardContainer.style.display = "grid";
      boardContainer.style.gridTemplateColumns = `repeat(${dimension}, 1fr)`;
      // Clear container:
      boardContainer.innerHTML = "";
      // Create a tile for each cell.
      for (let i = 0; i < board.length; i++) {
        const tile = document.createElement("div");
        tile.className = "tile";
        // Set tile size based on container width (optional: 70px per tile)
        tile.style.height = "70px";
        tile.style.lineHeight = "70px";
        if (board[i] === 0) {
          tile.classList.add("empty");
          tile.innerText = "";
        } else {
          tile.innerText = board[i];
          tile.addEventListener("click", function() {
            moveTile(i);
          });
        }
        boardContainer.appendChild(tile);
      }
    }

    /* ---------- Find Empty Cell ---------- */
    function findEmptyIndex() {
      return board.indexOf(0);
    }

    /* ---------- Check Adjacency ---------- */
    function isAdjacent(index1, index2) {
      const row1 = Math.floor(index1 / dimension);
      const col1 = index1 % dimension;
      const row2 = Math.floor(index2 / dimension);
      const col2 = index2 % dimension;
      const diff = Math.abs(row1 - row2) + Math.abs(col1 - col2);
      return diff === 1;
    }

    /* ---------- Move Tile ---------- */
    function moveTile(index) {
      const emptyIndex = findEmptyIndex();
      if (isAdjacent(index, emptyIndex)) {
        // Swap tile and empty
        [board[index], board[emptyIndex]] = [board[emptyIndex], board[index]];
        moveCount++;
        score += 10;
        correctMoves++;
        renderBoard();
        updateStatus();

        if (isSolved()) {
          endGame();
        }
      } else {
        // Wrong move: subtract points and count error
        score -= 10;
        errors++;
        updateStatus();
        flashTile(index, "wrong");
        if (errors >= MAX_ERRORS) {
          endGame();
        }
      }
    }

    /* ---------- Flash Tile with Color Effect ---------- */
    function flashTile(index, color) {
      // Temporarily change the background color of the tile.
      const tile = boardContainer.children[index];
      const originalColor = tile.style.backgroundColor;
      tile.style.backgroundColor = color;
      setTimeout(() => { tile.style.backgroundColor = originalColor; }, 300);
    }

    /* ---------- Update Status Display ---------- */
    function updateStatus() {
      document.getElementById("scoreDisplay").innerText = score;
      document.getElementById("correctDisplay").innerText = correctMoves;
      document.getElementById("errorDisplay").innerText = errors;
      document.getElementById("moveCount").innerText = moveCount;
    }

    /* ---------- Shuffle Board ---------- */
    // We shuffle by making 100 random valid moves from the solved board.
    function shuffleBoard() {
      initBoard(); // Start from solved board.
      const moves = 100;
      for (let i = 0; i < moves; i++) {
        const emptyIndex = findEmptyIndex();
        // Find all indices adjacent to empty.
        const adjacent = [];
        for (let j = 0; j < board.length; j++) {
          if (isAdjacent(j, emptyIndex)) {
            adjacent.push(j);
          }
        }
        // Randomly choose one adjacent cell and swap.
        const randIndex = adjacent[Math.floor(Math.random() * adjacent.length)];
        [board[emptyIndex], board[randIndex]] = [board[randIndex], board[emptyIndex]];
      }
      moveCount = 0;
      score = 0;
      correctMoves = 0;
      errors = 0;
      updateStatus();
      renderBoard();
    }

    /* ---------- Check if Board is Solved ---------- */
    function isSolved() {
      // For solved board, the order should be 1,2,..., n-1,0
      for (let i = 0; i < board.length - 1; i++) {
        if (board[i] !== i + 1) return false;
      }
      return board[board.length - 1] === 0;
    }

    /* ---------- End Game ---------- */
    function endGame() {
      // Save record if solved or if game over because of error count.
      let msg;
      if (isSolved()) {
        msg = "Puzzle solved in " + moveCount + " moves!";
      } else {
        msg = "Game Over! Too many errors.";
      }
      document.getElementById("message").innerText = msg;
      saveRecord();
    }

    /* ---------- Event listeners for controls ---------- */
    document.getElementById("shuffleBtn").addEventListener("click", shuffleBoard);

    /* ---------- Records Storage using localStorage ---------- */
    function saveRecord() {
      const playerName = document.getElementById("playerName").value.trim() || "Anonymous";
      const record = {
        name: playerName,
        score: score,
        correct: correctMoves,
        moves: moveCount,
        errors: errors,
        date: new Date().toLocaleString(),
        puzzle: dimension === 3 ? "8 Puzzle" : "15 Puzzle"
      };
      let records = JSON.parse(localStorage.getItem("puzzleRecords") || "[]");
      records.push(record);
      // Sort records descending by score.
      records.sort((a, b) => b.score - a.score);
      localStorage.setItem("puzzleRecords", JSON.stringify(records));
    }

    function loadRecords() {
      const tbody = document.querySelector("#recordsTable tbody");
      tbody.innerHTML = "";
      let records = JSON.parse(localStorage.getItem("puzzleRecords") || "[]");
      if (records.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = "<td colspan='6'>No records available.</td>";
        tbody.appendChild(row);
        return;
      }
      records.forEach(rec => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${rec.name}</td><td>${rec.score}</td><td>${rec.correct}</td><td>${rec.moves}</td><td>${rec.errors}</td><td>${rec.date}</td>`;
        tbody.appendChild(row);
      });
    }

    function clearRecords() {
      if (confirm("Are you sure you want to clear all records?")) {
        localStorage.removeItem("puzzleRecords");
        loadRecords();
      }
    }

    /* ---------- Initialize Game on Page Load ---------- */
    initBoard();  // set board to solved configuration
    loadRecords();

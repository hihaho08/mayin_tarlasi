const container = document.getElementById('container');
const message = document.getElementById('message');

const GRID_SIZE = 10;
const MINE_COUNT = 20;

let grid = [];
let mines = [];

function initializeGrid() {
    // Grid oluştur
    for (let i = 0; i < GRID_SIZE; i++) {
        grid[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            grid[i][j] = {
                isOpen: false,
                isMine: false,
                count: 0,
                isFlagged: false
            };
        }
    }
}

function placeMines() {
    // Mayınları rasgele yerleştir
    let placedMines = 0;
    while (placedMines < MINE_COUNT) {
        let x = Math.floor(Math.random() * GRID_SIZE);
        let y = Math.floor(Math.random() * GRID_SIZE);
        if (!grid[x][y].isMine) {
            grid[x][y].isMine = true;
            mines.push({ x, y });
            placedMines++;
        }
    }
}

function calculateAdjacentMines() {
    // Komşu hücrelerdeki mayınları say
    for (let mine of mines) {
        const { x, y } = mine;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (x + dx >= 0 && x + dx < GRID_SIZE && y + dy >= 0 && y + dy < GRID_SIZE) {
                    grid[x + dx][y + dy].count++;
                }
            }
        }
    }
}

function renderGrid() {
    container.innerHTML = '';
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            container.appendChild(cell);
        }
    }
}

function handleCellClick(row, col) {
    const cell = grid[row][col];
    if (cell.isFlagged || cell.isOpen) return;

    cell.isOpen = true;
    const cellElement = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
    cellElement.classList.add('open');

    if (cell.isMine) {
        revealMines();
        gameOver();
    } else {
        if (cell.count === 0) {
            openAdjacentCells(row, col);
        } else {
            cellElement.textContent = cell.count;
        }
    }

    checkWin();
}

function openAdjacentCells(row, col) {
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (row + dx >= 0 && row + dx < GRID_SIZE && col + dy >= 0 && col + dy < GRID_SIZE) {
                const adjacentCell = grid[row + dx][col + dy];
                if (!adjacentCell.isOpen && !adjacentCell.isFlagged) {
                    handleCellClick(row + dx, col + dy);
                }
            }
        }
    }
}

function revealMines() {
    for (let mine of mines) {
        const { x, y } = mine;
        const cellElement = document.querySelector(`.cell[data-row='${x}'][data-col='${y}']`);
        cellElement.classList.add('mine');
        cellElement.textContent = '💣';
    }
}

function flagCell(event, row, col) {
    event.preventDefault();
    const cell = grid[row][col];
    if (cell.isOpen) return;

    cell.isFlagged = !cell.isFlagged;
    const cellElement = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
    cellElement.classList.toggle('flagged');
}

function checkWin() {
    let openCount = 0;
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j].isOpen) {
                openCount++;
            }
        }
    }
    if (openCount === GRID_SIZE * GRID_SIZE - MINE_COUNT) {
        gameOver(true);
    }
}

function gameOver(win = false) {
    if (win) {
        message.textContent = '🎉 Aferin! 🎉';
    } else {
        message.textContent = '💥 Yandın!💥';
    }
    message.style.display = 'block';
    container.removeEventListener('click', handleCellClick);
    container.removeEventListener('contextmenu', flagCell);

    // Restart button ekleyelim
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart';
    restartButton.addEventListener('click', function() {
        restartGame();
    });
    message.appendChild(restartButton);
}

function restartGame() {
    message.style.display = 'none';
    container.innerHTML = '';
    grid = [];
    mines = [];
    initializeGrid();
    placeMines();
    calculateAdjacentMines();
    renderGrid();
    container.addEventListener('click', function(event) {
        const cell = event.target.closest('.cell');
        if (cell) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            handleCellClick(row, col);
        }
    });
    container.addEventListener('contextmenu', function(event) {
        const cell = event.target.closest('.cell');
        if (cell) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            flagCell(event, row, col);
        }
    });
}

// Başlangıçta oyunu başlat
document.addEventListener('DOMContentLoaded', function() {
    restartGame();
});

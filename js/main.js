const GRID_SIZE = 10;
let gridArray = [];
let shipLengths = [];
let totalShips = 0;
let isGameStarted = false;
const messageElement = document.getElementById('message');

function createGrid(gridElement) {
    gridArray = []; 
    for (let row = 0; row < GRID_SIZE; row++) {
        const gridRow = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-item');
            cell.setAttribute('data-x', col);
            cell.setAttribute('data-y', row);
            gridElement.appendChild(cell);
            gridRow.push(cell);
        }
        gridArray.push(gridRow);
    }
}

function setDifficulty(difficulty) {
    if (difficulty === 'easy') {
        shipLengths = [5, 4, 3, 2];
        totalShips = 4;
    } else if (difficulty === 'medium') {
        shipLengths = [5, 4, 3, 3, 2, 2];
        totalShips = 6;
    } else if (difficulty === 'hard') {
        shipLengths = [5, 4, 4, 3, 3, 2, 2, 2];
        totalShips = 8;
    } else {
        shipLengths = [5, 4, 3, 2];
        totalShips = 4;
    }
}

function placeBrowserShips(difficulty) {
    for (const length of shipLengths) {
        let shipPlaced = false;
        while (!shipPlaced) {
            const horizontal = Math.random() < 0.5;
            const xMax = horizontal ? GRID_SIZE - length : GRID_SIZE;
            const yMax = horizontal ? GRID_SIZE : GRID_SIZE - length;
            const x = Math.floor(Math.random() * xMax);
            const y = Math.floor(Math.random() * yMax);

            if (canPlaceShip(x, y, horizontal, length, difficulty)) {
                placeShip(x, y, horizontal, length);
                shipPlaced = true;
            }
        }
    }
}

function canPlaceShip(x, y, horizontal, length, difficulty) {
    // Проверка, что корабль не выходит за границы игрового поля
    if (x < 0 || x >= GRID_SIZE || y >= GRID_SIZE || y < 0) {
        return false;
    }

    const isCellEmpty = (x, y) => {
        // Проверка, что клетка пуста и не содержит другие корабли
        return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && !gridArray[y][x].classList.contains('ship');
    };

    let dx = [0, 1, 0, -1];
    let dy = [-1, 0, 1, 0];

    // Добавление проверки углов для уровня сложности "hard"
    if (difficulty === 'hard') {
        dx.push(-1, 1, 1, -1);
        dy.push(-1, -1, 1, 1);
    }

    for (let i = 0; i < length; i++) {
        let nextX = horizontal ? x + i : x;
        let nextY = horizontal ? y : y + i;

        if (!isCellEmpty(nextX, nextY)) {
            return false;
        }

        // Проверка смежности с другими кораблями для уровня сложности "easy"
        if (difficulty === 'easy') {
            for (let count1 = -1; count1 <= length; count1++) {
                for (let count2 = -1; count2 <= 1; count2 += 2) {
                    let checkX = horizontal ? x + count1 : x + count2;
                    let checkY = horizontal ? y + count2 : y + count1;
                    if (checkX >= 0 && checkX < GRID_SIZE && checkY >= 0 && checkY < GRID_SIZE && gridArray[checkY][checkX].classList.contains('ship')) {
                        return false;
                    }
                }
            }
        }
    }

    /// Разрешение боковой смежности, но не смежности углов для уровней сложности "medium" и "hard"
    if (difficulty === 'medium' || difficulty === 'hard') {
        for (let count1 = -1; count1 <= length; count1++) {
            for (let count2 = -1; count2 <= 1; count2 += 2) {
                let checkX = horizontal ? x + count1 : x + count2;
                let checkY = horizontal ? y + count2 : y + count1;

                // Проверка только границ вокруг корабля
                if (count1 === -1 || count1 === length) {
                    if (!isCellEmpty(checkX, checkY) && difficulty === 'medium') {
                        return false;
                    }
                } else {
                    if (horizontal) {
                        if (!isCellEmpty(x + count1, y - 1) || !isCellEmpty(x + count1, y + 1)) {
                            return false;
                        }
                    } else {
                        if (!isCellEmpty(x - 1, y + count1) || !isCellEmpty(x + 1, y + count1)) {
                            return false;
                        }
                    }
                }
            }
        }
    }

    return true;
}

function placeShip(x, y, horizontal, length){
    for (let count = 0; count < length; count++) {
        if (horizontal) {
            gridArray[y][x + count].classList.add('ship');
        } else {
            gridArray[y + count][x].classList.add('ship');
        }
    }
}

// Функция отображения результата выстрела
function renderShotResults(x, y, result) {
    const cell = gridArray[y][x];
    cell.classList.add(result);
    cell.classList.add('shot');
    cell.removeEventListener('click', gridItemClick);
}

// Функция для обработки клика по элементу сетки
function gridItemClick(event) {
    if (isGameStarted) {
        const cell = event.target;
        const x = parseInt(cell.getAttribute('data-x'), 10);
        const y = parseInt(cell.getAttribute('data-y'), 10);
        if (!cell.classList.contains('shot')) {
            if (!cell.classList.contains('ship')) {
                renderShotResults(x, y, 'miss');
            } else {
                renderShotResults(x, y, 'hit');
                const shipCells = findShipCells(x, y);
                if (shipCells.length > 0 && isShipSunk(shipCells)) {
                    markSurroundingCells(shipCells);
                }
                if (areBrowserShipsSunk()) {
                    isGameStarted = false;
                }
            }
        }
    }
}
function findShipCells(x, y) {
    const shipCells = [];
    if (gridArray[y][x].classList.contains('ship')) {
        shipCells.push({ x, y });
        let left = x - 1,
            right = x + 1,
            up = y - 1,
            down = y + 1;

        while (left >= 0 && gridArray[y][left].classList.contains('ship')) {
            shipCells.push({ x: left, y });
            left--;
        }
        while (right < GRID_SIZE && gridArray[y][right].classList.contains('ship')) {
            shipCells.push({ x: right, y });
            right++;
        }
        while (up >= 0 && gridArray[up][x].classList.contains('ship')) {
            shipCells.push({ x, y: up });
            up--;
        }
        while (down < GRID_SIZE && gridArray[down][x].classList.contains('ship')) {
            shipCells.push({ x, y: down });
            down++;
        }
    }
    return shipCells;
}

// Функция для проверки того, не затонул ли корабль
function isShipSunk(shipCells) {
    for (const { x, y } of shipCells) {
        if (!gridArray[y][x].classList.contains('hit')) {
            return false;
        }
    }
    return true;
}

// Функция, позволяющая помечать окружающие ячейки затонувшего корабля как пропущенные
function markSurroundingCells(shipCells) {
    const markedCells = new Set(); // Создаем набор для отслеживания уже помеченных ячеек
    shipCells.forEach(({ x, y }) => {
        for (let count1 = y - 1; count1 <= y + 1; count1++) {
            for (let count2 = x - 1; count2 <= x + 1; count2++) {
                if (count1 >= 0 && count1 < GRID_SIZE && count2 >= 0 && count2 < GRID_SIZE) {
                    if (!markedCells.has(`${count2},${count1}`)) {
                        const cell = gridArray[count1][count2];
                        if (!cell.classList.contains('shot') && !cell.classList.contains('ship')) {
                            renderShotResults(count2, count1, 'miss');
                            markedCells.add(`${count2},${count1}`);
                        }
                    }
                }
            }
        }
    });
}

function areBrowserShipsSunk(){
    let browserShipsLeft = 0;
    for(let count1 = 0; count1 < GRID_SIZE; count1++){
        for(let count2 = 0; count2 < GRID_SIZE; count2++){
            const cell = gridArray[count1][count2];
            if(cell.classList.contains('ship') && !cell.classList.contains('hit')) {
                browserShipsLeft++;
            }
        }
    }
    
    if (browserShipsLeft === 0) {
        messageElement.textContent = 'Поздравляю, вы победили!';
        messageElement.classList.add('active');
        return true;
    }

    return false;
}
function startGame() {
    isGameStarted = true;
    messageElement.textContent = '';
    messageElement.classList.remove('active');
    gridArray.forEach((row) => {
        row.forEach((cell) => {
            cell.classList.remove('shot', 'hit', 'miss', 'ship');
            cell.removeEventListener('click', gridItemClick);
            cell.addEventListener('click', gridItemClick);
        });
    });
    const selectedDifficulty = document.getElementById('difficultySelect').value;
    setDifficulty(selectedDifficulty);
    placeBrowserShips(selectedDifficulty);
}

function main() {
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('difficultySelect').addEventListener('change', (event) => {
        const selectedDifficulty = event.target.value;
        const grid = document.getElementById('grid');
        grid.innerHTML = '';
        setDifficulty(selectedDifficulty);
        createGrid(grid);
    });
    createGrid(document.getElementById('grid'));
}

main();

const gridSize = 10;
let gridArray = [];
let shipLengths = [];
let totalShips = 0;
let isGameStarted = false;
const messageElement = document.getElementById('message');

function createGrid(grid) {
    gridArray = []; // Очищаем массив при создании новой сетки
    for (let count = 0; count < gridSize; count++) {
        const row = [];
        for (let count2 = 0; count2 < gridSize; count2++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-item');
            cell.setAttribute('data-x', count2);
            cell.setAttribute('data-y', count);
            grid.appendChild(cell);
            row.push(cell);
        }
        gridArray.push(row);
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

//Функция для размещения кораблей браузера на поле
function placeBrowserShips(difficulty){
    for (const length of shipLengths) {
        let shipPlaced = false;
        while(!shipPlaced){
            const horizontal = Math.random() < 0.5;
            const xMax = horizontal ? gridSize - length : gridSize;
            const yMax = horizontal ? gridSize : gridSize - length;
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
    if (x < 0 || x >= gridSize || y >= gridSize || y < 0) {
        return false;
    }

    const checkCell = (x, y) => {
        return x >= 0 && x < gridSize && y >= 0 && y < gridSize && !gridArray[y][x].classList.contains('ship');
    };

    let dx = [0, 1, 0, -1];
    let dy = [-1, 0, 1, 0];

    // Для уровня "Профессионал" добавляем проверку углов
    if (difficulty === 'hard') {
        dx.push(-1, 1, 1, -1);
        dy.push(-1, -1, 1, 1);
    }

    for (let i = 0; i < length; i++) {
        let nx = horizontal ? x + i : x;
        let ny = horizontal ? y : y + i;

        if (!checkCell(nx, ny)) {
            return false;
        }

        // Для уровня "Начальный" проверяем, что корабли не соприкасаются ни по горизонтали, ни по вертикали
        if (difficulty === 'easy') {
            for (let i = -1; i <= length; i++) {
                for (let j = -1; j <= 1; j += 2) {
                    let cx = horizontal ? x + i : x + j;
                    let cy = horizontal ? y + j : y + i;
                    if (cx >= 0 && cx < gridSize && cy >= 0 && cy < gridSize && gridArray[cy][cx].classList.contains('ship')) {
                        return false;
                    }
                }
            }
        }
    }

    // Для уровня "Средний" и "Профессионал" разрешаем соприкосновение сторонами, но не углами для "Средний"
    if (difficulty === 'medium' || difficulty === 'hard') {
        for (let i = -1; i <= length; i++) {
            for (let j = -1; j <= 1; j += 2) {
                let nx = horizontal ? x + i : x + j;
                let ny = horizontal ? y + j : y + i;

                // Проверяем только границы вокруг корабля
                if (i === -1 || i === length) {
                    if (!checkCell(nx, ny) && difficulty === 'medium') {
                        return false;
                    }
                } else {
                    if (horizontal) {
                        if (!checkCell(x + i, y - 1) || !checkCell(x + i, y + 1)) {
                            return false;
                        }
                    } else {
                        if (!checkCell(x - 1, y + i) || !checkCell(x + 1, y + i)) {
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
            gridArray[y][x + count].classList.add('ship')
        } else {
            gridArray[y + count][x].classList.add('ship')
        }
    }
}

//Функция отображения результата выстрела
function renderShotResults(x, y, result) {
    const cell = gridArray[y][x];
    cell.classList.add(result);
    cell.classList.add('shot');
    cell.removeEventListener('click', gridItemClick);
}

//Функция для обработки клика
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
        while (right < gridSize && gridArray[y][right].classList.contains('ship')) {
            shipCells.push({ x: right, y });
            right++;
        }
        while (up >= 0 && gridArray[up][x].classList.contains('ship')) {
            shipCells.push({ x, y: up });
            up--;
        }
        while (down < gridSize && gridArray[down][x].classList.contains('ship')) {
            shipCells.push({ x, y: down });
            down++;
        }
    }
    return shipCells;
}

// Функция для проверки, был ли потоплен корабль
function isShipSunk(shipCells) {
    for (const { x, y } of shipCells) {
        if (!gridArray[y][x].classList.contains('hit')) {
            return false;
        }
    }
    return true;
}

// Функция для маркировки ячеек вокруг потопленного корабля как промахи
function markSurroundingCells(shipCells) {
    shipCells.forEach(({ x, y }) => {
        for (let count = y - 1; count <= y + 1; count++) {
            for (let count2 = x - 1; count2 <= x + 1; count2++) {
                if (count >= 0 && count < gridSize && count2 >= 0 && count2 < gridSize) {
                    const cell = gridArray[count][count2];
                    if (!cell.classList.contains('shot')) {
                        renderShotResults(count2, count, 'miss');
                    }
                }
            }
        }
    });
}

function areBrowserShipsSunk(){
    let browserShipsLeft = 0;
    for(let count = 0; count < gridSize; count++){
        for(let count2 = 0; count2 < gridSize; count2++){
            const cell = gridArray[count][count2];
            if(cell.classList.contains('ship') && !cell.classList.contains('hit')) {
                browserShipsLeft++;
            }
        }
    }
    
    if (browserShipsLeft === 0) {
        messageElement.textContent = 'Поздравляем, вы победили!';
        messageElement.classList.add('active');
        return true; // Все корабли потоплены
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
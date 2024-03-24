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

            if (difficulty === 'easy' && canPlaceShipEasy(x, y, horizontal, length)) {
                placeShip(x, y, horizontal, length);
                shipPlaced = true;
            } else if (difficulty === 'medium' && canPlaceShipMedium(x, y, horizontal, length)) {
                placeShip(x, y, horizontal, length);
                shipPlaced = true;
            } else if (difficulty === 'hard' && canPlaceShipHard(x, y, horizontal, length)) {
                placeShip(x, y, horizontal, length);
                shipPlaced = true;
            }
        }
    }
}

//Функции для проверки возможности расположения корабля
function canPlaceShipEasy(x, y, horizontal, length) {
    if (x < 0 || x >= gridSize || y >= gridSize || y < 0){
        return false;
    }

    const isCellEmpty = (count, count2) => {
        return count >= 0 && count < gridSize && count2 >= 0 && count2 < gridSize && !gridArray[count2][count].classList.contains('ship');
    };

    if (horizontal) {
        if (x + length > gridSize) {
            return false;
        }

        for (let count = x - 1; count < x + length + 1; count++) {
            for (let count2 = y - 1; count2 < y + 2; count2++) {
                if (!isCellEmpty(count, count2)) {
                    return false;
                }
            }
        }
    } else {
        if (y + length > gridSize) {
            return false;
        }

        for (let count = y - 1; count < y + length + 1; count++) {
            for (let count2 = x - 1; count2 < x + 2; count2++) {
                if (!isCellEmpty(count2, count)) {
                    return false;
                }
            }
        }
    }

    return true;
}    

function canPlaceShipMedium(x, y, horizontal, length) {
    if (x < 0 || x >= gridSize || y >= gridSize || y < 0){
        return false;
    }

    if (horizontal) {
        if(x + length > gridSize) {
            return false;
        }
        for (let count = x - 1; count < x + length + 1; count++) {
            for (let count2 = y - 1; count2 <= y + 1; count2++) {
                if ((count === x - 1 || count === x + length || count2 === y - 1 || count2 === y + 1) &&
                    gridArray[count2] && gridArray[count2][count] && gridArray[count2][count].classList.contains('ship')) {
                    return false;
                }
            }
        }
    } else {
        if (y + length > gridSize) {
            return false;
        }
        for (let count = y - 1; count < y + length + 1; count++) {
            for (let count2 = x - 1; count2 <= x + 1; count2++) {
                if ((count === y - 1 || count === y + length || count2 === x - 1 || count2 === x + 1) &&
                    gridArray[count] && gridArray[count][count2] && gridArray[count][count2].classList.contains('ship')) {
                    return false;
                }
            }
        }
    }        

    return true;
}    

function canPlaceShipHard(x, y, horizontal, length) {
    if (x < 0 || x >= gridSize || y >= gridSize || y < 0){
        return false;
    }

    
    if (horizontal) {
        if (x + length > gridSize) {
            return false; 
        }
        for (let count = y - 1; count < y + 2; count++) {
            for (let count2 = x - 1; count2 < x + length + 1; count2++) {
                if (gridArray[count] && gridArray[count][count2] && gridArray[count][count2].classList.contains('ship')) {
                    return false; 
                }
            }
        }
    } else { 
        if (y + length > gridSize) {
            return false; 
        }
        for (let count = y - 1; count < y + length + 1; count++) {
            for (let count2 = x - 1; count2 < x + 2; count2++) {
                if (gridArray[count] && gridArray[count][count2] && gridArray[count][count2].classList.contains('ship')) {
                    return false; 
                }
            }
        }
    }

    // Проверка углов
    for (let count = y - 1; count < y + length + 1; count++) {
        for (let count2 = x - 1; count2 < x + length + 1; count2++) {
            if (gridArray[count] && gridArray[count][count2] && gridArray[count][count2].classList.contains('ship')) {
                return false; 
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
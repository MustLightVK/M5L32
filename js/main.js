function battleShipGame(){
    const gridSize = 10;
    const shipLengths = [5, 4, 3, 3, 2, 2, 1];
    const gridArray = []; // [Array(gridSize),Array(gridSize),Array(gridSize),Array(gridSize),Array(gridSize),Array(gridSize),Array(gridSize),Array(gridSize),Array(gridSize),Array(gridSize)]

    let isGameStarted = false;

    //Функция для игрового поля
    function createGrid(grid){
        for(let i = 0; i < gridSize; i++) {
            const row = [];
            for (let j = 0; j < gridSize; j++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-item');
                cell.setAttribute('data-x', j);
                cell.setAttribute('data-y', i);
                grid.appendChild(cell);
                row.push(cell);
            }
            gridArray.push(row);
        }
    }

    //Функция для размещения кораблей браузера на поле
    function placeBrowserShips(){
        for (const length of shipLengths) {
            let shipPlaced = false;
            while(!shipPlaced){
                const horizontal = Math.random() < 0.5; //случайный выбор ориентации корабля 50 на 50
                const xMax = horizontal ? gridSize - length : gridSize;
                const yMax = horizontal ? gridSize : gridSize - length;
                const x = Math.floor(Math.random() * xMax);
                const y = Math.floor(Math.random() * yMax);
                if(canPlaceShip(x, y, horizontal, length)){
                    placeShip(x, y, horizontal, length);
                    shipPlaced = true;
                }
            }
        }
    }

    //Функция для проверки возможности расположения корабля
    function canPlaceShip(x, y, horizontal, length){
        if (x < 0 || x >= gridSize || y >= gridSize || y < 0){
            return false;
        }
        if (horizontal) {
            if(x + length > gridSize) {
                return false;
            } else {
                if (y + length > gridSize) {
                    return false;
                }
            }
        }

        for (let counter = -1; counter < length; counter++){
            for (let counter2 = -1; counter2 <=1; counter2++) {
                const row = gridArray[y + counter];
                if (!row) continue;

                for(let counter3 = -1; counter3 <= 1; counter3++) {
                    const cell = row[x + counter2 + counter3];
                    if (cell  && cell.classList.contains('ship')){
                        return false;
                    }
                }
            }
        }

        return true;

    }

    function placeShip(x, y, horizontal, length){
        for (let counter = 0; counter < length; counter++) {
            if (horizontal) {
                gridArray[y][x + counter].classList.add('ship')
            } else {
                gridArray[y + counter][x].classList.add('ship')
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
    function gridItemClick(event){
        if(isGameStarted){
            const cell = event.target;
            const x = parseInt(cell.getAttribute('data-x'), 10);
            const y = parseInt(cell.getAttribute('data-y'), 10);            
            if (!cell.classList.contains('ship')) {
                renderShotResults(x, y, 'miss')
            } else {
                renderShotResults(x, y, 'hit')
            }

            if(areBrowserShipsSunk()){
                alert('Поздравляем, вы победили!')
                isGameStarted = false;
            }
        }

    }

    //Функция, которая проверяет, остались ли на поле корабли

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
        return browserShipsLeft === 0;
    }

    document.getElementById('startButton').addEventListener('click', () => {
        isGameStarted = true;

        gridArray.forEach((row) =>{
            row.forEach((cell) =>{
                cell.classList.remove('shot', 'hit', 'miss', 'ship')
                cell.addEventListener('click', gridItemClick)
            })
        })
        placeBrowserShips();
    })

    createGrid(document.getElementById('grid'));
}

battleShipGame();
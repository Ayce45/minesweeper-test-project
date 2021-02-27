let $grid = document.querySelector('.grid');
let mine = 10;
let shovel = 'audio/shovel.mp3'
let boom = 'audio/explosion.mp3';
let $timer = document.querySelector('#timer');
let $flager = document.querySelector('#flags');
let highscores;
let interval;
let grid = [];
let startTime = new Date()
let time = 0;
let flag = 0;

if (sessionStorage.getItem('highscores')) {
    highscores = JSON.parse(sessionStorage.getItem('highscores'));
} else {
    sessionStorage.setItem('highscores', JSON.stringify([]));
    highscores = JSON.parse(sessionStorage.getItem('highscores'));
}

if (sessionStorage.getItem('game')) {
    let game = JSON.parse(sessionStorage.getItem('game'));
    grid = game.grid;
    startTime = game.startTime;
    flag = game.flag;
    setTimer();
    loadTimer();
    reloadTemplateGame();
} else {
    sessionStorage.setItem('game', JSON.stringify([]));
    init();
}

function saveGame() {
    let game = {};
    game.grid = grid;
    game.startTime = startTime;
    game.flag = flag;
    sessionStorage.setItem('game', JSON.stringify(game));
}

function startGame() {
    clearInterval(interval);
    $timer.innerHTML = '00:00';
    $flager.innerHTML = "0";
    startTime = new Date();
    flag = 0;
    init();
}

function loadTimer() {
    interval = setInterval(function () {
        setTimer();
        saveGame();
    }, 1000);
}

function setTimer() {
    time = Math.round((new Date() - new Date(startTime)) / 1000);
    let minutes = Math.floor(time / 60);
    let seconds = time - minutes * 60;
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    $timer.innerHTML = minutes + ':' + seconds;
}


function floodFill(i, y) {
    if (i < 10 && y < 10 && i > -1 && y > -1 && grid[i][y].status === 'covered') {
        grid[i][y].status = 'uncovered';
        if (grid[i][y].mineCount !== 0) {
            grid[i][y].status = grid[i][y].status + ' has-indicator';
        }
        if (grid[i][y].mineCount === 0) {
            floodFill(Number(i) + 1, y);
            floodFill(Number(i) - 1, y);
            floodFill(i, Number(y) + 1);
            floodFill(i, Number(y) - 1);
        }
    }
}

function reloadTemplateGame() {
    let covered = 0
    for (let i = 0; i < 10; i++) {
        for (let y = 0; y < 10; y++) {
            grid[i][y].status === "covered" ? covered++ : '';
        }
    }
    if (covered === 10) {
        clearInterval(interval);
        let user = window.prompt("Gagner ! Votre nom ?");
        highscores.push({name: user, time: time})
        highscores = highscores.sort((a, b) => {
            if (a.time > b.time) {
                return 1
            } else {
                return -1
            }
        })
        sessionStorage.setItem('highscores', JSON.stringify(highscores))
        window.location.href = 'highscores.html';
    }
    let templateGame = '';
    for (let i = 0; i < 10; i++) {
        templateGame += `<div class="row">`;
        for (let y = 0; y < 10; y++) {
            if (grid[i][y].status === "covered") {
                templateGame += `<button data-i="${i}" data-y="${y}" class="box ${grid[i][y].mined ? 'mined' : ''}"></button>`;
            } else {
                templateGame += `<div data-i="${i}" data-y="${y}" class="box ${grid[i][y].status}" data-mine-count="${grid[i][y].mineCount}"></div>`;
            }
        }
        templateGame += `</div>`;
    }

    $grid.innerHTML = templateGame;

    let $box = document.querySelectorAll('.box');
    let i = 0;
    let y = 0;
    $box.forEach(function (item) {
        if (y === 10) {
            y = 0;
            i++;
        }
        if (grid[i][y].status === "covered") {
            item.addEventListener('click', function () {
                const i = item.dataset.i;
                const y = item.dataset.y;
                if (grid[i][y].mined) {
                    grid[i][y].status = 'uncovered mined';
                    new Audio(boom).play().then(() => {
                        if (confirm('Perdu ! Voulez-vous recommencer ?')) {
                            startGame();
                        } else {
                            window.location.href = 'highscores.html';
                        }
                    });
                } else {
                    floodFill(i, y);
                    new Audio(shovel).play();
                }
                reloadTemplateGame();
            });
            item.addEventListener('contextmenu', function () {
                const i = item.dataset.i;
                const y = item.dataset.y;
                grid[i][y].status = 'flagged';
                flag++;
                reloadTemplateGame();
            })
        } else if (grid[i][y].status === "flagged") {
            item.addEventListener('click', function () {
                const i = item.dataset.i;
                const y = item.dataset.y;
                grid[i][y].status = 'covered';
                flag--;
                reloadTemplateGame();
            });
        }
        y++;
    });
    $flager.innerHTML = flag;
    saveGame();
}


function init() {
    grid = [];
    for (let i = 0; i < 10; i++) {
        grid[i] = [];
        for (let y = 0; y < 10; y++) {
            grid[i].push({status: 'covered', mined: false, mineCount: 0});
        }
    }
    let mined = 0;
    while (mined < mine) {
        let i = Math.floor(Math.random() * 9) + 1;
        let y = Math.floor(Math.random() * 9) + 1;
        if (grid[i][y].mined !== true) {
            grid[i][y].mined = true;
            if (i + 1 < 10)
                grid[i + 1][y].mineCount++;
            if (i - 1 > -1)
                grid[i - 1][y].mineCount++;
            if (y + 1 < 10)
                grid[i][y + 1].mineCount++;
            if (y - 1 > -1)
                grid[i][y - 1].mineCount++;
            if (i + 1 < 10 && y + 1 < 10)
                grid[i + 1][y + 1].mineCount++;
            if (i - 1 > -1 && y - 1 > -1)
                grid[i - 1][y - 1].mineCount++;
            if (i - 1 > -1 && y + 1 < 10)
                grid[i - 1][y + 1].mineCount++;
            if (i + 1 < 10 && y - 1 < -1)
                grid[i + 1][y - 1].mineCount++;
            mined++;
        }
    }
    reloadTemplateGame(grid);
    loadTimer();
}
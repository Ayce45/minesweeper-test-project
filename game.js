let $timer = document.querySelector('#timer');
let $flager = document.querySelector('#flager');
let shovel = 'audio/shovel.mp3';
let explosion = 'audio/explosion.mp3';
let $grid = document.querySelector('.grid');
let startTime;
let time;
let flag = 0;
let interval;
let grid = [];

if (!sessionStorage.getItem('highscores')) {
    sessionStorage.setItem('highscores', JSON.stringify([]));
}

function startGame() {
    startTime = new Date();
    time = Math.round((new Date() - startTime) / 1000);
    flag = 0;
    startTimer();
    init();
}

function startTimer() {
    setTimer();
    interval = setInterval(function () {
        setTimer();
        saveGame();
    }, 1000);
}

function setTimer() {
    time = Math.round((new Date() - startTime) / 1000)
    let seconds = time % 60;
    let minutes = Math.round(time / 60);

    $timer.innerHTML = ("0" + minutes).slice(-2) + ':' + ("0" + seconds).slice(-2);
}

function saveGame() {
    let game = {};
    game.startTime = startTime;
    game.grid = grid;
    game.flag = flag;
    sessionStorage.setItem("game", JSON.stringify(game));
}

function resumeGame() {
    let game = JSON.parse(sessionStorage.getItem("game"));
    startTime = new Date(game.startTime);
    grid = game.grid;
    flag = game.flag;
    reloadGrid();
    startTimer();
}

function init() {
    for (let i = 0; i < 10; i++) {
        grid[i] = [];
        for (let y = 0; y < 10; y++) {
            grid[i][y] = {status: "covered", mined: false, mineCount: 0}
        }
    }

    let mined = 0;
    while (mined !== 10) {
        let i = Math.round(Math.random() * 9);
        let y = Math.round(Math.random() * 9);
        if (!grid[i][y].mined) {
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
            if (i + 1 < 10 && y - 1 > -1)
                grid[i + 1][y - 1].mineCount++;
            if (i - 1 < -1 && y + 1 < 10)
                grid[i - 1][y + 1].mineCount++;
            mined++;
        }
    }
    reloadGrid();
}

function reloadGrid() {
    $flager.innerHTML = flag;
    let gridTemplate = "";
    for (let i = 0; i < 10; i++) {
        gridTemplate += '<div class="row">'
        for (let y = 0; y < 10; y++) {
            let box = grid[i][y];
            if (box.status === "covered") {
                gridTemplate += `<button data-i="${i}" data-y="${y}" class="box ${box.mined ? ' mined' : ''}"></button>`;
            } else {
                gridTemplate += `<div data-i="${i}" data-y="${y}" class="box ${box.status}${box.mined && box.status !== 'flagged' ? ' mined' : ''}${box.mineCount && !box.mined && box.status !== 'flagged' ? ' has-indicator' : ''}" ${box.mineCount && !box.mined && box.status !== 'flagged' ? 'data-mine-count=' + grid[i][y].mineCount : ''}></div>`;
            }
        }
        gridTemplate += '</div>'
    }
    $grid.innerHTML = gridTemplate;
    let $boxs = $grid.querySelectorAll('.box');
    $boxs.forEach(function (item) {
        let i = item.dataset.i;
        let y = item.dataset.y;
        let box = grid[i][y];
        if (box.status === "covered") {
            item.addEventListener('mousedown', function (e) {
                console.log(e.button);
                if (e.button === 0) {
                    if (box.mined) {
                        new Audio(explosion).play().then(() => {
                            if (confirm('Perdu ! Voulez-vous recommencer ?')) {
                                startGame();
                            } else {
                                clearInterval(interval);
                                sessionStorage.removeItem('game');
                                window.open('highscores.html', '_self');
                            }
                        });
                    } else {
                        new Audio(shovel).play().then(() => uncovered(i, y));
                    }
                } else {
                    box.status = 'flagged';
                    flag++;
                    reloadGrid();
                }
            });
        }
    });
}

function uncovered(i, y) {
    let cover = 0;
    grid.forEach((item) => {
        item.forEach((item) => {
            if (item.status === 'covered')
                cover++;
        })
    })
    if (cover === 10) {
        clearInterval(interval);
        let username = prompt('Bravo ! Quelles est votre nom ?', "");
        let highscores = JSON.parse(sessionStorage.getItem('highscores'));
        highscores.push({username: username, time: time});
        highscores = highscores.sort((a, b) => {
            if (a.time > b.time) {
                return 1
            } else {
                return -1
            }
        });
        sessionStorage.setItem('highscores', JSON.stringify(highscores));
        window.open('highscores.html', '_self');
    } else {
        i = Number(i);
        y = Number(y);
        if (i < 10 && y < 10 && i > -1 && y > -1 && grid[i][y].status === "covered") {
            let box = grid[i][y];
            box.status = 'uncovered';
            if (box.mineCount !== 0) {
                box.status = box.status + ' has-indicator';
            }
            if (grid[i][y].mineCount === 0) {
                uncovered(i + 1, y);
                uncovered(i - 1, y);
                uncovered(i, y + 1);
                uncovered(i, y - 1);
            }
        }
    }
    reloadGrid();
}

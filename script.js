if (sessionStorage.getItem('game')) {
    resumeGame(sessionStorage.getItem('game'));
} else {
    startGame();
}

document.addEventListener("contextmenu", (e) => e.preventDefault());
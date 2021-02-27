let highscores;
if (sessionStorage.getItem('highscores')) {
    highscores = JSON.parse(sessionStorage.getItem('highscores'));
} else {
    sessionStorage.setItem('highscores', JSON.stringify([]));
    highscores = JSON.parse(sessionStorage.getItem('highscores'));
}
let $highscores = document.querySelector('.highscores ul');
let $btn = document.querySelector('.highscores a');

$btn.addEventListener('click',function () {
   sessionStorage.removeItem('game');
});

let template = '';
for (let i = 0;i < 3 && i < highscores.length;i++) {
    let minutes = Math.floor(highscores[i].time / 60);
    let seconds = highscores[i].time - minutes * 60;
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    let time = minutes + 'mn ' + seconds +'sec';
    template += `<li>${i + 1}. ${highscores[i].name} <span class="time">${time}</span></li>`
}
$highscores.innerHTML = template;



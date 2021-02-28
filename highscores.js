let $highscores = document.querySelector('.highscores ul');
let $btn =  document.querySelector('.highscores .btn');

$btn.addEventListener('click', function () {
    sessionStorage.removeItem('game');
})

if (!sessionStorage.getItem('highscores')) {
    sessionStorage.setItem('highscores', JSON.stringify([]));
}

let highscores = JSON.parse(sessionStorage.getItem('highscores'));

let template = '';
for (let i = 0;i < 3 && i < highscores.length;i++) {
    let seconds = highscores[i].time % 60;
    let minutes = Math.round(highscores[i].time / 60);
    let time =  ("0" + minutes).slice(-2) + 'mn' + ("0" + seconds).slice(-2) +'sec';

    template += `<li>${i + 1}. ${highscores[i].username} <span class="time">${time}</span></li>`
}

$highscores.innerHTML = template;
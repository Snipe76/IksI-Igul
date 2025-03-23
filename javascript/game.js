let playingGame = true;
let playerTurn = 0;
const player1 = 'X';
const player2 = 'O';

const buttons = Array.from(document.querySelectorAll('.grid-button'));
const instructions = document.getElementById('instructions');
buttons.forEach(button => button.addEventListener('click', playerClick));

function playerClick(event) {
    if (!playingGame) return;

    const button = event.target;
    if (playerTurn % 2 === 0) {
        button.innerHTML = `<span class='X'>${player1}</span>`;
        button.classList.add('X');
        button.disabled = true;
        instructions.innerHTML = "<span class='O'>O</span>'s turn";
    } else {
        button.innerHTML = `<span class='O'>${player2}</span>`;
        button.classList.add('O');
        button.disabled = true;
        instructions.innerHTML = "<span class='X'>X</span>'s turn";
    }

    playerTurn++;
    checkWinner();
}

function checkWinner() {
    const winningCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (let i = 0; i < winningCombos.length; i++) {
        const [a, b, c] = winningCombos[i];
        if (buttons[a].textContent && buttons[a].textContent === buttons[b].textContent && buttons[a].textContent === buttons[c].textContent) {
            alert(`${buttons[a].textContent} wins!`);
            playingGame = false;
            instructions.innerHTML = `<span class='${buttons[a].textContent}'>${buttons[a].textContent}</span> wins!`;
            const direction = getDirection(a, b, c);
            buttons[a].classList.add('winner', direction);
            buttons[b].classList.add('winner', direction);
            buttons[c].classList.add('winner', direction);
        }
    }

    if (playerTurn === 9 && playingGame) {
        alert('It\'s a tie!');
        playingGame = false;
        instructions.textContent = 'It\'s a tie!';
    }
}

function getDirection(a, b, c) {
    if (a % 3 === b % 3 && b % 3 === c % 3) {
        return 'vertical';
    } else if (Math.floor(a / 3) === Math.floor(b / 3) && Math.floor(b / 3) === Math.floor(c / 3)) {
        return 'horizontal';
    } else if (a === 0 && c === 8) {
        return 'diagonal-left';
    } else {
        return 'diagonal-right';
    }
}

function resetGame() {
    buttons.forEach(button => {
        button.innerHTML = '';
        button.disabled = false;
        button.classList.remove('X');
        button.classList.remove('O');
        button.classList.remove('winner', 'horizontal', 'vertical', 'diagonal-left', 'diagonal-right');
    });

    playingGame = true;
    playerTurn = 0;
    instructions.innerHTML = "<span class='X'>X</span> starts the game";
}
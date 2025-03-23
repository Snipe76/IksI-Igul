let playingGame = true;
let playerTurn = 0;
const player1 = 'X';
const player2 = 'O';

const buttons = Array.from(document.querySelectorAll('.grid-button'));
buttons.forEach(button => button.addEventListener('click', playerClick));

function playerClick(event) {
    if (!playingGame) return;

    const button = event.target;
    if (playerTurn % 2 === 0) {
        button.textContent = player1;
        button.classList.add('X');
        button.disabled = true;
    } else {
        button.textContent = player2;
        button.classList.add('O');
        button.disabled = true;
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
        }
    }

    if (playerTurn === 9 && playingGame) {
        alert('It\'s a tie!');
        playingGame = false;
    }
}

function resetGame() {
    buttons.forEach(button => {
        button.textContent = '';
        button.disabled = false;
        button.classList.remove('X');
        button.classList.remove('O');
    });

    playingGame = true;
    playerTurn = 0;
}
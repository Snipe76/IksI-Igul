// Game state variables
let playingGame = true;
let playerTurn = 0;
const player1 = 'X';
const player2 = 'O';

// Get references to the buttons and instructions
const buttons = Array.from(document.querySelectorAll('.grid-button'));
const instructions = document.getElementById('instructions');
const winLine = document.getElementById('win-line');

// Function to trigger confetti
function celebrateWin() {
    const colors = ['#ff0000', '#0000ff'];
    const end = Date.now() + 1000;

    // Launch confetti from both sides
    const leftConfetti = () => {
        if (Date.now() < end) {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.7 },
                colors: colors
            });
            requestAnimationFrame(leftConfetti);
        }
    };

    const rightConfetti = () => {
        if (Date.now() < end) {
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.7 },
                colors: colors
            });
            requestAnimationFrame(rightConfetti);
        }
    };

    leftConfetti();
    rightConfetti();
}

// Add event listeners to the buttons
buttons.forEach(button => button.addEventListener('click', playerClick));

// Function to handle button clicks
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

// Function to check for a winner
function checkWinner() {
    const winningCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];

    const winLineClasses = [
        'row-0', 'row-1', 'row-2',
        'col-0', 'col-1', 'col-2',
        'diagonal-1', 'diagonal-2'
    ];

    for (let i = 0; i < winningCombos.length; i++) {
        const [a, b, c] = winningCombos[i];
        const btnA = buttons[a];
        const btnB = buttons[b];
        const btnC = buttons[c];

        if (btnA.textContent &&
            btnA.textContent === btnB.textContent &&
            btnA.textContent === btnC.textContent) {

            setTimeout(() => {
                alert(`${btnA.textContent} wins!`);
            }, 100);

            playingGame = false;
            instructions.innerHTML = `<span class='${btnA.textContent}'>${btnA.textContent}</span> wins!`;

            [btnA, btnB, btnC].forEach(button => {
                button.classList.add('winner');
                button.style.pointerEvents = 'none';
            });

            // Show the win line
            winLine.className = winLineClasses[i];
            winLine.style.display = 'block';

            // Trigger confetti celebration
            celebrateWin();

            buttons.forEach(button => {
                if (!button.classList.contains('winner')) {
                    button.disabled = true;
                }
            });
            return;
        }
    }

    if (playerTurn === 9 && playingGame) {
        setTimeout(() => alert('It\'s a tie!'), 100);
        playingGame = false;
        instructions.textContent = 'It\'s a tie!';
    }
}

// Function to reset the game
function resetGame() {
    buttons.forEach(button => {
        button.innerHTML = '';
        button.disabled = false;
        button.style.pointerEvents = 'auto';
        button.classList.remove('X', 'O', 'winner');
    });

    // Hide the win line
    winLine.style.display = 'none';
    winLine.className = '';

    playingGame = true;
    playerTurn = 0;

    instructions.innerHTML = "<span class='X'>X</span> starts the game";
}
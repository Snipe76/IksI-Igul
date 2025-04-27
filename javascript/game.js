// Game state variables
let playingGame = true;
let playerTurn = 0;
const player1 = 'X';
const player2 = 'O';

// Game elements
let buttons;
let instructions;
let winLine;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initializeGame);

function initializeGame() {
    // Get references to the buttons and instructions
    buttons = Array.from(document.querySelectorAll('.grid-button'));
    instructions = document.getElementById('instructions');
    winLine = document.getElementById('win-line');
    const resetButton = document.getElementById('reset');

    // Add event listeners
    buttons.forEach(button => {
        button.addEventListener('click', playerClick);
        button.addEventListener('touchstart', handleTouchStart, { passive: true });
    });

    // Prevent double-tap zoom on mobile
    document.addEventListener('touchend', preventZoom);
}

// Touch event handlers
function handleTouchStart(event) {
    // Prevent any default touch behaviors
    event.preventDefault();

    // Trigger click event
    event.target.click();
}

function preventZoom(event) {
    // Prevent double-tap zoom
    if (event.cancelable) {
        event.preventDefault();
    }
}

// Function to trigger confetti
function celebrateWin(winnerClass) {
    const colors = winnerClass === 'X' ? ['#ff0000'] : ['#0000ff'];

    // Check if device is mobile
    const isMobile = window.innerWidth <= 768;

    // Configure confetti based on device
    const config = {
        particleCount: isMobile ? 100 : 400,
        spread: isMobile ? 200 : 200,
        startVelocity: isMobile ? 30 : 60,
        gravity: 0.8,
        scalar: isMobile ? 0.7 : 1,
        disableForReducedMotion: true,
        colors: colors
    };

    try {
        // Single burst for mobile, three bursts for desktop
        if (isMobile) {
            // Center burst for mobile
            confetti({
                ...config,
                origin: { x: 0.5, y: 0.6 }
            });
        } else {
            let burstCount = 0;
            const maxBursts = 2;
            const burstInterval = 300; // Time between bursts in ms

            const fireBurst = () => {
                if (burstCount < maxBursts) {
                    // Left side burst
                    confetti({
                        ...config,
                        angle: 60,
                        origin: { x: 0, y: 0.7 }
                    });

                    // Right side burst
                    confetti({
                        ...config,
                        angle: 120,
                        origin: { x: 1, y: 0.7 }
                    });

                    burstCount++;
                    if (burstCount < maxBursts) {
                        setTimeout(fireBurst, burstInterval);
                    }
                }
            };

            fireBurst();
        }
    } catch (error) {
        console.error('Confetti error:', error);
    }
}

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

            playingGame = false;
            instructions.innerHTML = `<span class='${btnA.textContent}'>${btnA.textContent}</span> wins!`;

            [btnA, btnB, btnC].forEach(button => {
                button.classList.add('winner');
                button.style.pointerEvents = 'none';
            });

            // Show the win line
            winLine.className = winLineClasses[i];
            winLine.style.display = 'block';

            // Disable all buttons
            buttons.forEach(button => {
                if (!button.classList.contains('winner')) {
                    button.disabled = true;
                }
            });

            // Trigger confetti with winner's color
            celebrateWin(btnA.textContent);
            return;
        }
    }

    if (playerTurn === 9 && playingGame) {
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
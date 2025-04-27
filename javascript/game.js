// Game state variables
let playingGame = true;
let playerTurn = 0;
const player1 = 'X';
const player2 = 'O';
let isVsComputer = false;
let aiPlayer = null;
let isAIThinking = false;

// Game elements
let buttons;
let instructions;
let winLine;
let resetButton;
let modeSwitch;
let gameModeText;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initializeGame);

function initializeGame() {
    // Get references to the buttons and instructions
    buttons = Array.from(document.querySelectorAll('.grid-button'));
    instructions = document.getElementById('instructions');
    winLine = document.getElementById('win-line');
    resetButton = document.getElementById('reset');
    modeSwitch = document.getElementById('mode-switch');
    gameModeText = document.getElementById('game-mode');

    // Add event listeners
    buttons.forEach(button => {
        button.addEventListener('click', playerClick);
        button.addEventListener('touchstart', handleTouchStart, { passive: true });
    });

    // Add reset button event listeners
    resetButton.addEventListener('click', resetGame);
    resetButton.addEventListener('touchstart', handleResetTouch, { passive: false });
    resetButton.addEventListener('touchend', handleResetTouchEnd);

    // Add mode switch button event listeners
    modeSwitch.addEventListener('click', toggleGameMode);
    modeSwitch.addEventListener('touchstart', handleModeSwitchTouch, { passive: false });
    modeSwitch.addEventListener('touchend', handleModeSwitchTouchEnd);

    // Initialize AI player
    aiPlayer = new AIPlayer('normal');

    // Prevent double-tap zoom on mobile
    document.addEventListener('touchend', preventZoom);
}

// Function to toggle game mode
function toggleGameMode() {
    if (isAIThinking) return; // Don't allow mode switch while AI is thinking

    isVsComputer = !isVsComputer;
    modeSwitch.textContent = isVsComputer ? 'vs Human' : 'vs Computer';
    modeSwitch.classList.toggle('vs-human', isVsComputer);

    // Update game mode text
    gameModeText.innerHTML = `Playing against: <span>${isVsComputer ? 'Computer' : 'Another Player'}</span>`;
    gameModeText.classList.toggle('vs-computer', isVsComputer);

    resetGame();
}

// Touch event handlers
function handleTouchStart(event) {
    if (!playingGame || isAIThinking) return;

    const button = event.target;
    if (button.getAttribute('data-played') === 'true') {
        event.preventDefault();
        return;
    }

    event.preventDefault();
    playerClick(event);
}

function handleResetTouch(event) {
    event.preventDefault();
    resetButton.classList.add('active');
}

function handleResetTouchEnd(event) {
    event.preventDefault();
    resetButton.classList.remove('active');
    resetGame();
}

function preventZoom(event) {
    // Prevent double-tap zoom
    if (event.cancelable) {
        event.preventDefault();
    }
}

// Touch event handlers for mode switch
function handleModeSwitchTouch(event) {
    if (isAIThinking) return; // Don't allow mode switch while AI is thinking
    event.preventDefault();
    modeSwitch.classList.add('active');
}

function handleModeSwitchTouchEnd(event) {
    if (isAIThinking) return; // Don't allow mode switch while AI is thinking
    event.preventDefault();
    modeSwitch.classList.remove('active');
    toggleGameMode();
}

// Remove onclick from HTML since we're handling it in JavaScript
modeSwitch.removeAttribute('onclick');

// Function to handle button clicks
function playerClick(event) {
    if (!playingGame || isAIThinking) return;

    const button = event.target;
    if (button.getAttribute('data-played') === 'true') return;

    // Handle player move
    if (playerTurn % 2 === 0) {
        makeMove(button, player1);

        // If vs computer and game is still going, make AI move
        if (isVsComputer && playingGame) {
            isAIThinking = true;
            disableAllButtons(true);
            setTimeout(makeAIMove, 500); // Add delay for better UX
        }
    } else if (!isVsComputer) {
        makeMove(button, player2);
    }
}

// Function to make a move
function makeMove(button, player) {
    if (button.textContent || !playingGame || button.getAttribute('data-played') === 'true') return;

    // Immediately mark as played to prevent double moves
    button.setAttribute('data-played', 'true');
    button.style.pointerEvents = 'none';

    button.innerHTML = `<span class='${player}'>${player}</span>`;
    button.classList.add(player);
    button.disabled = true;

    playerTurn++;
    updateInstructions();
    checkWinner();
}

// Function to make AI move
function makeAIMove() {
    if (!playingGame) {
        isAIThinking = false;
        disableAllButtons(false);
        return;
    }

    // Get current game state
    const gameState = buttons.map(button => {
        if (!button.textContent) return null;
        return button.textContent;
    });

    // Get AI's move
    const aiMove = aiPlayer.getBestMove(gameState);

    if (aiMove !== null) {
        makeMove(buttons[aiMove], player2);
    }

    isAIThinking = false;
    disableAllButtons(false);
}

// Function to disable/enable all buttons
function disableAllButtons(disable) {
    disablePlayButtons(disable);

    // Also disable mode switch and reset during AI turn only
    modeSwitch.disabled = disable;
    resetButton.disabled = disable;

    if (disable) {
        modeSwitch.style.opacity = '0.7';
        resetButton.style.opacity = '0.7';
    } else {
        modeSwitch.style.opacity = '1';
        resetButton.style.opacity = '1';
    }
}

// Function to disable/enable only play buttons
function disablePlayButtons(disable) {
    buttons.forEach(button => {
        if (button.getAttribute('data-played') === 'true') {
            // Always ensure played buttons are completely disabled
            button.disabled = true;
            button.style.pointerEvents = 'none';
        } else {
            button.disabled = disable;
            button.style.pointerEvents = disable ? 'none' : 'auto';
            button.style.cursor = disable ? 'not-allowed' : 'pointer';
        }
    });
}

// Function to update instructions
function updateInstructions() {
    if (!playingGame) return;

    if (isVsComputer) {
        instructions.innerHTML = playerTurn % 2 === 0 ?
            "<span class='X'>Your turn</span>" :
            "<span class='O'>Computer thinking...</span>";
    } else {
        instructions.innerHTML = playerTurn % 2 === 0 ?
            "<span class='X'>X</span>'s turn" :
            "<span class='O'>O</span>'s turn";
    }
}

// Function to handle tie game
function handleTie() {
    playingGame = false;

    // Add tie game class to grid for animation
    const gridElement = document.querySelector('.grid');
    gridElement.classList.add('tie');

    // Disable only play buttons
    disablePlayButtons(true);

    // Update instructions with animated text
    instructions.innerHTML = '<span class="tie-text">It\'s a tie!</span>';

    // Add tie game class after initial shake animation
    setTimeout(() => {
        gridElement.classList.remove('tie');
        gridElement.classList.add('tie-game');

        // Trigger special tie game confetti
        try {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ffcc00', '#ffffff', '#666666'],
                gravity: 1.2
            });
        } catch (error) {
            console.error('Confetti error:', error);
        }
    }, 500);
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

            // Add win celebration class to grid
            const gridElement = document.querySelector('.grid');
            gridElement.classList.add('win-celebration');

            // Update instructions with animated win message
            instructions.innerHTML = `<span class='win-text ${btnA.textContent}'>${btnA.textContent} wins!</span>`;

            // Add winner class and player class to winning cells
            [btnA, btnB, btnC].forEach(button => {
                button.classList.add('winner', btnA.textContent);
                button.style.pointerEvents = 'none';
            });

            // Show the win line with a slight delay for better animation timing
            setTimeout(() => {
                winLine.className = winLineClasses[i];
                winLine.style.display = 'block';
            }, 200);

            // Disable only play buttons
            disablePlayButtons(true);

            // Trigger confetti with winner's color
            celebrateWin(btnA.textContent);
            return;
        }
    }

    if (playerTurn === 9 && playingGame) {
        handleTie();
    }
}

// Function to reset the game
function resetGame() {
    if (!buttons) return; // Safety check

    isAIThinking = false;
    disablePlayButtons(false);

    buttons.forEach(button => {
        button.innerHTML = '';
        button.disabled = false;
        button.style.pointerEvents = 'auto';
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        button.classList.remove('X', 'O', 'winner');
        button.removeAttribute('data-played');
    });

    // Hide the win line
    if (winLine) {
        winLine.style.display = 'none';
        winLine.className = '';
    }

    // Remove tie game classes
    const gridElement = document.querySelector('.grid');
    gridElement.classList.remove('tie', 'tie-game', 'win-celebration');

    playingGame = true;
    playerTurn = 0;

    if (instructions) {
        instructions.innerHTML = "<span class='X'>X</span> starts the game";
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
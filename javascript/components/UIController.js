export class UIController {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.buttons = Array.from(document.querySelectorAll('.grid-button'));
        this.instructions = document.getElementById('instructions');
        this.winLine = document.getElementById('win-line');
        this.resetButton = document.getElementById('reset');
        this.modeSwitch = document.getElementById('mode-switch');
        this.gameModeText = document.getElementById('game-mode');
        this.difficultyContainer = document.getElementById('difficulty-container');
        this.difficultySelect = document.getElementById('difficulty');
        this.gridElement = document.querySelector('.grid');

        if (!this.validateElements()) {
            throw new Error('Required game elements not found');
        }
    }

    validateElements() {
        return this.buttons.length &&
            this.instructions &&
            this.winLine &&
            this.resetButton &&
            this.modeSwitch &&
            this.gameModeText &&
            this.difficultyContainer &&
            this.difficultySelect;
    }

    initializeEventListeners() {
        // Grid buttons
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => this.handlePlayerClick(e));
            button.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        });

        // Reset button
        this.resetButton.addEventListener('click', () => this.handleReset());
        this.resetButton.addEventListener('touchstart', (e) => this.handleResetTouch(e), { passive: false });
        this.resetButton.addEventListener('touchend', (e) => this.handleResetTouchEnd(e));

        // Mode switch
        this.modeSwitch.addEventListener('click', () => this.handleModeSwitch());
        this.modeSwitch.addEventListener('touchstart', (e) => this.handleModeSwitchTouch(e), { passive: false });
        this.modeSwitch.addEventListener('touchend', (e) => this.handleModeSwitchTouchEnd(e));

        // Difficulty select
        this.difficultySelect.addEventListener('change', () => this.handleDifficultyChange());

        // Prevent zoom on mobile
        document.addEventListener('touchend', (e) => this.preventZoom(e), { passive: true });
    }

    handlePlayerClick(event) {
        const button = event.target;
        const index = parseInt(button.dataset.index, 10);
        const gameState = this.gameEngine.getGameState();

        // Don't allow moves if:
        // - Game is not active
        // - AI is thinking
        // - Button is already played
        // - Invalid index
        // - It's computer mode and it's not player's turn (O's turn)
        if (!gameState.playingGame ||
            gameState.isAIThinking ||
            button.getAttribute('data-played') === 'true' ||
            isNaN(index) || index < 0 || index > 8 ||
            (gameState.isVsComputer && gameState.currentPlayer === 'O')) {
            return;
        }

        this.makeMove(button, index);
    }

    makeMove(button, index) {
        const gameState = this.gameEngine.getGameState();
        const currentPlayer = gameState.currentPlayer;

        if (this.gameEngine.makeMove(index)) {
            this.updateButton(button, currentPlayer);
            this.checkGameEnd();

            // Only trigger AI turn if:
            // - Game is vs computer
            // - Game is still active
            // - Game is not over
            // - Current player is O (AI's turn)
            const newState = this.gameEngine.getGameState();
            if (newState.isVsComputer &&
                this.gameEngine.playingGame &&
                !this.gameEngine.isGameOver &&
                newState.currentPlayer === 'O') {
                this.handleAITurn();
            }
        }
    }

    updateButton(button, player) {
        button.setAttribute('data-played', 'true');
        button.style.pointerEvents = 'none';
        button.innerHTML = `<span class='${player}'>${player}</span>`;
        button.classList.add(player);
        button.disabled = true;
    }

    handleAITurn() {
        // Don't make AI move if:
        // - Game is over
        // - AI is already thinking
        // - It's not computer mode
        // - It's not O's turn
        const gameState = this.gameEngine.getGameState();
        if (this.gameEngine.isGameOver ||
            this.gameEngine.isAIThinking ||
            !gameState.isVsComputer ||
            gameState.currentPlayer !== 'O') {
            return;
        }

        this.gameEngine.isAIThinking = true;
        this.disableAllButtons(true);
        this.updateInstructions();

        setTimeout(() => {
            const aiMove = this.gameEngine.aiPlayer.getBestMove(this.gameEngine);

            if (aiMove !== null && !this.gameEngine.isGameOver) {
                this.makeMove(this.buttons[aiMove], aiMove);
            }

            this.gameEngine.isAIThinking = false;
            this.disableAllButtons(false);
            this.updateInstructions();
        }, 500);
    }

    checkGameEnd() {
        const result = this.gameEngine.checkGameStatus();

        if (!result.isOver) {
            this.updateInstructions();
            return;
        }

        if (!result.winner) {
            this.handleTie();
        } else {
            this.handleWin({
                winner: result.winner,
                combo: result.winningLine
            });
        }
    }

    handleWin(result) {
        this.gameEngine.playingGame = false;
        this.gridElement.classList.add('win-celebration');

        // Mark winning cells
        result.combo.forEach(index => {
            const button = this.buttons[index];
            button.classList.add('winner', result.winner);
        });

        // Show win line
        this.showWinLine(result.combo);

        // Update instructions
        this.instructions.innerHTML = `<span class='win-text ${result.winner}'>${result.winner} wins!</span>`;

        // Disable buttons
        this.disablePlayButtons(true);

        // Trigger confetti
        this.celebrateWin(result.winner);
    }

    handleTie() {
        this.gameEngine.playingGame = false;
        this.gridElement.classList.add('tie');

        setTimeout(() => {
            this.gridElement.classList.remove('tie');
            this.gridElement.classList.add('tie-game');
            this.triggerTieConfetti();
        }, 500);

        this.instructions.innerHTML = '<span class="tie-text">It\'s a tie!</span>';
        this.disablePlayButtons(true);
    }

    showWinLine(combo) {
        const lineClasses = [
            'row-0', 'row-1', 'row-2',
            'col-0', 'col-1', 'col-2',
            'diagonal-1', 'diagonal-2'
        ];

        let lineClass = '';
        if (combo[0] === combo[1] - 1 && combo[1] === combo[2] - 1) {
            // Row
            lineClass = `row-${Math.floor(combo[0] / 3)}`;
        } else if (combo[0] === combo[1] - 3 && combo[1] === combo[2] - 3) {
            // Column
            lineClass = `col-${combo[0] % 3}`;
        } else if (combo[0] === 0 && combo[2] === 8) {
            // Main diagonal
            lineClass = 'diagonal-1';
        } else {
            // Anti-diagonal
            lineClass = 'diagonal-2';
        }

        setTimeout(() => {
            this.winLine.className = lineClass;
            this.winLine.style.display = 'block';
        }, 200);
    }

    celebrateWin(winner) {
        const colors = winner === 'X' ? ['#ff0000'] : ['#0000ff'];
        const isMobile = window.innerWidth <= 768;

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
            if (isMobile) {
                confetti({
                    ...config,
                    origin: { x: 0.5, y: 0.6 }
                });
            } else {
                let burstCount = 0;
                const maxBursts = 2;
                const burstInterval = 300;

                const fireBurst = () => {
                    if (burstCount < maxBursts) {
                        confetti({
                            ...config,
                            angle: 60,
                            origin: { x: 0, y: 0.7 }
                        });

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

    triggerTieConfetti() {
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
    }

    updateInstructions() {
        const gameState = this.gameEngine.getGameState();
        if (!gameState.playingGame) return;

        if (gameState.isVsComputer) {
            if (gameState.isAIThinking) {
                this.instructions.innerHTML = "<span class='O'>Computer thinking...</span>";
            } else {
                this.instructions.innerHTML = `<span class='${gameState.currentPlayer}'>${gameState.currentPlayer === 'X' ? 'Your' : 'Computer\'s'} turn</span>`;
            }
        } else {
            this.instructions.innerHTML = `<span class='${gameState.currentPlayer}'>${gameState.currentPlayer}</span>'s turn`;
        }
    }

    handleReset() {
        this.gameEngine.reset();
        this.resetUI();
    }

    resetUI() {
        this.buttons.forEach(button => {
            button.innerHTML = '';
            button.disabled = false;
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.classList.remove('X', 'O', 'winner');
            button.removeAttribute('data-played');
        });

        this.winLine.style.display = 'none';
        this.winLine.className = '';
        this.gridElement.classList.remove('tie', 'tie-game', 'win-celebration');
        this.instructions.innerHTML = "<span class='X'>X</span> starts the game";
    }

    handleModeSwitch() {
        if (this.gameEngine.isAIThinking) return;

        const newMode = this.gameEngine.gameMode === 'pvp' ? 'pvc' : 'pvp';
        this.gameEngine.setGameMode(newMode);
        const gameState = this.gameEngine.getGameState();

        this.modeSwitch.textContent = gameState.isVsComputer ? 'vs Human' : 'vs Computer';
        this.modeSwitch.classList.toggle('vs-human', gameState.isVsComputer);
        this.difficultyContainer.classList.toggle('visible', gameState.isVsComputer);
        this.gameModeText.innerHTML = `Playing against: <span>${gameState.isVsComputer ? 'Computer' : 'Another Player'}</span>`;
        this.gameModeText.classList.toggle('vs-computer', gameState.isVsComputer);

        // Always reset when switching modes and ensure X starts
        this.gameEngine.reset();
        this.resetUI();

        // Update instructions to show it's player's turn (X)
        this.updateInstructions();
    }

    handleDifficultyChange() {
        if (this.gameEngine.isAIThinking) return;
        this.gameEngine.aiPlayer = new AIPlayer(this.difficultySelect.value);
        this.handleReset();
    }

    disableAllButtons(disable) {
        this.disablePlayButtons(disable);
        this.modeSwitch.disabled = disable;
        this.difficultySelect.disabled = disable;
        this.resetButton.disabled = disable;

        const opacity = disable ? '0.7' : '1';
        this.modeSwitch.style.opacity = opacity;
        this.difficultySelect.style.opacity = opacity;
        this.resetButton.style.opacity = opacity;
    }

    disablePlayButtons(disable) {
        this.buttons.forEach(button => {
            if (button.getAttribute('data-played') === 'true') {
                button.disabled = true;
                button.style.pointerEvents = 'none';
            } else {
                button.disabled = disable;
                button.style.pointerEvents = disable ? 'none' : 'auto';
                button.style.cursor = disable ? 'not-allowed' : 'pointer';
            }
        });
    }

    // Touch event handlers
    handleTouchStart(event) {
        const gameState = this.gameEngine.getGameState();
        if (!gameState.playingGame || gameState.isAIThinking) return;

        const button = event.target;
        if (button.getAttribute('data-played') === 'true') {
            event.preventDefault();
            return;
        }

        event.preventDefault();
        this.handlePlayerClick(event);
    }

    handleResetTouch(event) {
        event.preventDefault();
        this.resetButton.classList.add('active');
    }

    handleResetTouchEnd(event) {
        event.preventDefault();
        this.resetButton.classList.remove('active');
        this.handleReset();
    }

    handleModeSwitchTouch(event) {
        if (this.gameEngine.isAIThinking) return;
        event.preventDefault();
        this.modeSwitch.classList.add('active');
    }

    handleModeSwitchTouchEnd(event) {
        if (this.gameEngine.isAIThinking) return;
        event.preventDefault();
        this.modeSwitch.classList.remove('active');
        this.handleModeSwitch();
    }

    preventZoom(event) {
        if (event.cancelable) {
            event.preventDefault();
        }
    }
} 
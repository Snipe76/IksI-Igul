import { GAME_CONFIG } from '../core/config.js';

export class UIController {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.initializeElements();
        this.initializeEventListeners();
        this.updateInitialUI();
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
        return this.buttons.length === GAME_CONFIG.BOARD.TOTAL_CELLS &&
            this.instructions &&
            this.winLine &&
            this.resetButton &&
            this.modeSwitch &&
            this.gameModeText &&
            this.difficultyContainer &&
            this.difficultySelect;
    }

    initializeEventListeners() {
        this.initializeGridButtons();
        this.initializeControlButtons();
        this.initializeDifficultySelect();
        this.preventMobileZoom();
    }

    updateInitialUI() {
        // Set initial state of mode UI
        const gameState = this.gameEngine.getGameState();
        this.updateGameModeUI(gameState.gameMode);
        this.updateInstructions();
    }

    initializeGridButtons() {
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => this.handlePlayerClick(e));
            button.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        });
    }

    initializeControlButtons() {
        // Reset button
        this.resetButton.addEventListener('click', () => this.handleReset());
        this.resetButton.addEventListener('touchstart', (e) => this.handleResetTouch(e), { passive: false });
        this.resetButton.addEventListener('touchend', (e) => this.handleResetTouchEnd(e));

        // Mode switch
        this.modeSwitch.addEventListener('click', () => this.handleModeSwitch());
        this.modeSwitch.addEventListener('touchstart', (e) => this.handleModeSwitchTouch(e), { passive: false });
        this.modeSwitch.addEventListener('touchend', (e) => this.handleModeSwitchTouchEnd(e));
    }

    initializeDifficultySelect() {
        this.difficultySelect.addEventListener('change', () => this.handleDifficultyChange());
    }

    preventMobileZoom() {
        document.addEventListener('touchend', (e) => this.preventZoom(e), { passive: true });
    }

    handlePlayerClick(event) {
        const button = event.currentTarget;
        const index = parseInt(button.dataset.index, 10);
        const gameState = this.gameEngine.getGameState();

        if (!this.isValidPlayerMove(gameState, button, index)) {
            return;
        }

        this.makeMove(button, index);
    }

    isValidPlayerMove(gameState, button, index) {
        return gameState.playingGame &&
            !gameState.isAIThinking &&
            button.getAttribute('data-played') !== 'true' &&
            !isNaN(index) &&
            index >= 0 &&
            index < GAME_CONFIG.BOARD.TOTAL_CELLS &&
            !(gameState.isVsComputer && gameState.currentPlayer === GAME_CONFIG.PLAYERS.O);
    }

    makeMove(button, index) {
        const gameState = this.gameEngine.getGameState();
        const currentPlayer = gameState.currentPlayer;

        if (this.gameEngine.makeMove(index)) {
            this.updateButton(button, currentPlayer);
            this.checkGameEnd();

            const newState = this.gameEngine.getGameState();
            if (this.shouldTriggerAIMove(newState)) {
                this.handleAITurn();
            }
        }
    }

    shouldTriggerAIMove(gameState) {
        return gameState.isVsComputer &&
            this.gameEngine.playingGame &&
            !this.gameEngine.isGameOver &&
            gameState.currentPlayer === GAME_CONFIG.PLAYERS.O;
    }

    updateButton(button, player) {
        button.setAttribute('data-played', 'true');
        button.style.pointerEvents = 'none';
        button.innerHTML = `<span class='${player}'>${player}</span>`;
        button.classList.add(player);
        button.disabled = true;
    }

    handleAITurn() {
        const gameState = this.gameEngine.getGameState();
        if (!this.isValidAIMove(gameState)) {
            return;
        }

        this.gameEngine.isAIThinking = true;
        this.disableAllButtons(true);
        this.updateInstructions();

        // Use setTimeout to give visual feedback that AI is thinking
        setTimeout(() => {
            this.processAIMove();
        }, GAME_CONFIG.AI.MOVE_DELAY);
    }

    isValidAIMove(gameState) {
        return !this.gameEngine.isGameOver &&
            !this.gameEngine.isAIThinking &&
            gameState.isVsComputer &&
            gameState.currentPlayer === GAME_CONFIG.PLAYERS.O;
    }

    processAIMove() {
        if (!this.gameEngine.aiPlayer) {
            console.error('AI player not initialized');
            this.gameEngine.isAIThinking = false;
            this.disableAllButtons(false);
            return;
        }

        const aiMove = this.gameEngine.aiPlayer.getBestMove(this.gameEngine);

        if (aiMove !== null && !this.gameEngine.isGameOver) {
            const button = this.buttons[aiMove];
            this.makeMove(button, aiMove);
        }

        this.gameEngine.isAIThinking = false;
        this.disableAllButtons(false);
        this.updateInstructions();
    }

    checkGameEnd() {
        const result = this.gameEngine.checkGameStatus();

        if (!result.isOver) {
            this.updateInstructions();
            return;
        }

        result.winner ? this.handleWin(result) : this.handleTie();
    }

    handleWin(result) {
        this.gameEngine.playingGame = false;
        this.gridElement.classList.add(GAME_CONFIG.UI.CLASSES.WIN_CELEBRATION);

        this.markWinningCells(result);
        this.showWinLine(result.winningLine);
        this.updateWinInstructions(result.winner);
        this.disablePlayButtons(true);
        this.celebrateWin(result.winner);
    }

    markWinningCells(result) {
        result.winningLine.forEach(index => {
            const button = this.buttons[index];
            button.classList.add(GAME_CONFIG.UI.CLASSES.WINNER, result.winner);
        });
    }

    updateWinInstructions(winner) {
        this.instructions.innerHTML = `<span class='win-text ${winner}'>${winner} wins!</span>`;
    }

    handleTie() {
        this.gameEngine.playingGame = false;
        this.gridElement.classList.add(GAME_CONFIG.UI.CLASSES.TIE);

        setTimeout(() => {
            this.gridElement.classList.remove(GAME_CONFIG.UI.CLASSES.TIE);
            this.gridElement.classList.add(GAME_CONFIG.UI.CLASSES.TIE_GAME);
            this.triggerTieConfetti();
        }, GAME_CONFIG.UI.ANIMATION.TIE_ANIMATION_DELAY);

        this.instructions.innerHTML = '<span class="tie-text">It\'s a tie!</span>';
        this.disablePlayButtons(true);
    }

    showWinLine(combo) {
        const lineClasses = [
            'row-0', 'row-1', 'row-2',
            'col-0', 'col-1', 'col-2',
            'diag-0', 'diag-1'
        ];

        const winLineClass = this.getWinLineClass(combo);
        if (winLineClass) {
            this.winLine.className = winLineClass;
            // Make win line visible
            this.winLine.style.display = 'block';
        }
    }

    getWinLineClass(winningCells) {
        const [a, b, c] = winningCells;

        // Check for horizontal win (same row)
        const rowA = Math.floor(a / 3);
        const rowB = Math.floor(b / 3);
        if (rowA === rowB) {
            return `win-line row-${rowA}`;
        }

        // Check for vertical win (same column)
        const colA = a % 3;
        const colB = b % 3;
        if (colA === colB) {
            return `win-line col-${colA}`;
        }

        // Check for diagonal wins
        if (winningCells.includes(0) && winningCells.includes(4) && winningCells.includes(8)) {
            return 'win-line diag-0';
        }

        if (winningCells.includes(2) && winningCells.includes(4) && winningCells.includes(6)) {
            return 'win-line diag-1';
        }

        return '';
    }

    celebrateWin(winner) {
        const colors = winner === GAME_CONFIG.PLAYERS.X ? ['#FF0000', '#FF5555'] : ['#0000FF', '#5555FF'];

        const duration = GAME_CONFIG.UI.ANIMATION.WIN_CELEBRATION_DURATION;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: colors
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: colors
            });
        }, 250);
    }

    triggerTieConfetti() {
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const colors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00'];

        confetti({
            ...defaults,
            particleCount: 100,
            origin: { x: 0.5, y: 0.5 },
            colors: colors
        });
    }

    updateInstructions() {
        const gameState = this.gameEngine.getGameState();
        const currentPlayer = gameState.currentPlayer;

        if (gameState.isAIThinking) {
            this.instructions.innerHTML = 'Computer is thinking...';
        } else {
            this.instructions.innerHTML = `<span class="${currentPlayer}">${currentPlayer}</span>'s turn`;
        }
    }

    handleReset() {
        this.gameEngine.reset();
        this.resetUI();
    }

    resetUI() {
        this.buttons.forEach(button => {
            button.removeAttribute('data-played');
            button.style.pointerEvents = '';
            button.innerHTML = '';
            button.className = 'grid-button';
            button.disabled = false;
        });

        this.gridElement.classList.remove(
            GAME_CONFIG.UI.CLASSES.WIN_CELEBRATION,
            GAME_CONFIG.UI.CLASSES.TIE,
            GAME_CONFIG.UI.CLASSES.TIE_GAME
        );

        this.winLine.className = '';
        this.winLine.style.display = 'none';
        this.updateInstructions();
    }

    handleModeSwitch() {
        const newMode = this.gameEngine.gameMode === GAME_CONFIG.GAME_MODES.PVP
            ? GAME_CONFIG.GAME_MODES.PVC
            : GAME_CONFIG.GAME_MODES.PVP;

        this.gameEngine.setGameMode(newMode);
        this.updateGameModeUI(newMode);
        this.resetUI();
    }

    updateGameModeUI(mode) {
        const isPVC = mode === GAME_CONFIG.GAME_MODES.PVC;

        // Update button text
        this.modeSwitch.textContent = isPVC ? 'vs Player' : 'vs Computer';

        // Update game mode text
        this.gameModeText.innerHTML = `Playing against: <span>${isPVC ? 'Computer' : 'Another Player'}</span>`;

        // Show/hide difficulty selector
        if (isPVC) {
            this.difficultyContainer.style.display = 'block';
            this.difficultyContainer.classList.add('visible');
        } else {
            this.difficultyContainer.style.display = 'none';
            this.difficultyContainer.classList.remove('visible');
        }

        // Update UI classes
        this.modeSwitch.classList.toggle('vs-human', isPVC);
        this.gameModeText.classList.toggle('vs-computer', isPVC);
    }

    handleDifficultyChange() {
        if (!this.gameEngine.aiPlayer) {
            console.error('AI player not initialized');
            return;
        }

        this.gameEngine.aiPlayer.setDifficulty(this.difficultySelect.value);
        this.handleReset();
    }

    disableAllButtons(disable) {
        this.buttons.forEach(button => {
            if (button.getAttribute('data-played') !== 'true') {
                button.disabled = disable;
            }
        });
    }

    disablePlayButtons(disable) {
        this.buttons.forEach(button => {
            if (button.getAttribute('data-played') !== 'true') {
                button.style.pointerEvents = disable ? 'none' : '';
                button.disabled = disable;
            }
        });
    }

    handleTouchStart(event) {
        event.target.classList.add('touched');
    }

    handleResetTouch(event) {
        event.preventDefault();
        this.resetButton.classList.add('touched');
    }

    handleResetTouchEnd(event) {
        this.resetButton.classList.remove('touched');
        this.handleReset();
    }

    handleModeSwitchTouch(event) {
        event.preventDefault();
        this.modeSwitch.classList.add('touched');
    }

    handleModeSwitchTouchEnd(event) {
        this.modeSwitch.classList.remove('touched');
        this.handleModeSwitch();
    }

    preventZoom(event) {
        const target = event.target;
        if (target.classList.contains('touched')) {
            target.classList.remove('touched');
        }
    }
} 
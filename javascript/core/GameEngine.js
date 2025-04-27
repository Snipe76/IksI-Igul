export class GameEngine {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameMode = 'pvp'; // 'pvp' or 'pvc'
        this.aiPlayer = null;
        this.isGameOver = false;
        this.winner = null;
        this.winningLine = null;
        this.moveHistory = [];
        this.playingGame = true;
        this.isAIThinking = false;
    }

    reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.isGameOver = false;
        this.winner = null;
        this.winningLine = null;
        this.moveHistory = [];
        this.playingGame = true;
        this.isAIThinking = false;

        // If in computer mode and it's O's turn, trigger AI move
        if (this.gameMode === 'pvc' && this.currentPlayer === 'O') {
            this.currentPlayer = 'X';  // Ensure player starts as X
        }
    }

    makeMove(position) {
        // Validate move
        if (!this.playingGame || this.isGameOver || position < 0 || position > 8 || this.board[position] !== null) {
            return false;
        }

        // Make the move
        this.board[position] = this.currentPlayer;
        this.moveHistory.push(position);

        // Check for game end conditions
        const gameStatus = this.checkGameStatus();
        if (gameStatus.isOver) {
            this.isGameOver = true;
            this.winner = gameStatus.winner;
            this.winningLine = gameStatus.winningLine;
            return true;
        }

        // Switch players
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        return true;
    }

    checkGameStatus() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        // Check for win
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] &&
                this.board[a] === this.board[b] &&
                this.board[a] === this.board[c]) {
                return {
                    isOver: true,
                    winner: this.board[a],
                    winningLine: pattern
                };
            }
        }

        // Check for tie
        if (!this.board.includes(null)) {
            return {
                isOver: true,
                winner: null,
                winningLine: null
            };
        }

        // Game is still ongoing
        return {
            isOver: false,
            winner: null,
            winningLine: null
        };
    }

    getAvailableMoves() {
        return this.board
            .map((cell, index) => cell === null ? index : null)
            .filter(cell => cell !== null);
    }

    getBoardState() {
        return [...this.board];
    }

    setGameMode(mode) {
        if (mode !== 'pvp' && mode !== 'pvc') {
            throw new Error('Invalid game mode');
        }
        this.gameMode = mode;
        this.reset();  // Reset the game when mode changes
    }

    undoLastMove() {
        if (this.moveHistory.length === 0) {
            return false;
        }

        const lastPosition = this.moveHistory.pop();
        this.board[lastPosition] = null;
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.isGameOver = false;
        this.winner = null;
        this.winningLine = null;

        return true;
    }

    getGameState() {
        return {
            board: this.getBoardState(),
            currentPlayer: this.currentPlayer,
            isGameOver: this.isGameOver,
            winner: this.winner,
            winningLine: this.winningLine,
            gameMode: this.gameMode,
            playingGame: this.playingGame,
            isAIThinking: this.isAIThinking,
            isVsComputer: this.gameMode === 'pvc'
        };
    }
} 
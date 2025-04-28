import { GAME_CONFIG } from './config.js';

export class GameEngine {
    constructor() {
        this.initializeGameState();
    }

    initializeGameState() {
        this.board = Array(GAME_CONFIG.BOARD.TOTAL_CELLS).fill(null);
        this.currentPlayer = GAME_CONFIG.PLAYERS.X;
        this.gameMode = GAME_CONFIG.GAME_MODES.PVP;
        this.aiPlayer = null;
        this.isGameOver = false;
        this.winner = null;
        this.winningLine = null;
        this.moveHistory = [];
        this.playingGame = true;
        this.isAIThinking = false;
    }

    reset() {
        // Keep existing AI player when resetting
        const currentAiPlayer = this.aiPlayer;
        const currentGameMode = this.gameMode;

        this.board = Array(GAME_CONFIG.BOARD.TOTAL_CELLS).fill(null);
        this.currentPlayer = GAME_CONFIG.PLAYERS.X;
        this.gameMode = currentGameMode;
        this.aiPlayer = currentAiPlayer;
        this.isGameOver = false;
        this.winner = null;
        this.winningLine = null;
        this.moveHistory = [];
        this.playingGame = true;
        this.isAIThinking = false;
    }

    makeMove(position) {
        if (!this.isValidMove(position)) {
            return false;
        }

        this.board[position] = this.currentPlayer;
        this.moveHistory.push(position);

        const gameStatus = this.checkGameStatus();
        if (gameStatus.isOver) {
            this.handleGameOver(gameStatus);
            return true;
        }

        this.switchPlayer();
        return true;
    }

    isValidMove(position) {
        return this.playingGame &&
            !this.isGameOver &&
            position >= 0 &&
            position < GAME_CONFIG.BOARD.TOTAL_CELLS &&
            this.board[position] === null;
    }

    handleGameOver(gameStatus) {
        this.isGameOver = true;
        this.winner = gameStatus.winner;
        this.winningLine = gameStatus.winningLine;
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === GAME_CONFIG.PLAYERS.X
            ? GAME_CONFIG.PLAYERS.O
            : GAME_CONFIG.PLAYERS.X;
    }

    checkGameStatus() {
        // Check for win
        for (const pattern of GAME_CONFIG.BOARD.WIN_PATTERNS) {
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
        if (!Object.values(GAME_CONFIG.GAME_MODES).includes(mode)) {
            throw new Error('Invalid game mode');
        }
        this.gameMode = mode;
        this.reset();
    }

    undoLastMove() {
        if (this.moveHistory.length === 0) {
            return false;
        }

        const lastPosition = this.moveHistory.pop();
        this.board[lastPosition] = null;
        this.switchPlayer();
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
            isVsComputer: this.gameMode === GAME_CONFIG.GAME_MODES.PVC
        };
    }
} 
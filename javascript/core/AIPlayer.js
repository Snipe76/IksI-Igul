export class AIPlayer {
    constructor(difficulty = 'normal') {
        this.difficulty = difficulty;
        this.maxDepth = this.getMaxDepth(difficulty);
    }

    getMaxDepth(difficulty) {
        switch (difficulty.toLowerCase()) {
            case 'easy': return 1;
            case 'normal': return 3;
            case 'hard': return 5;
            default: return 3;
        }
    }

    getBestMove(gameEngine) {
        const board = [...gameEngine.getBoardState()];
        const availableMoves = gameEngine.getAvailableMoves();

        if (availableMoves.length === 0) {
            return null;
        }

        // For easy difficulty, sometimes make random moves
        if (this.difficulty.toLowerCase() === 'easy' && Math.random() < 0.4) {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        let bestScore = -Infinity;
        let bestMove = availableMoves[0];

        for (const move of availableMoves) {
            board[move] = 'O'; // AI is always O
            const score = this.minimax(board, this.maxDepth, false);
            board[move] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    minimax(board, depth, isMaximizing) {
        const result = this.checkWinner(board);

        if (result !== null) {
            return result === 'O' ? 10 : result === 'X' ? -10 : 0;
        }

        if (depth === 0) {
            return 0;
        }

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    maxScore = Math.max(maxScore, this.minimax(board, depth - 1, false));
                    board[i] = null;
                }
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    minScore = Math.min(minScore, this.minimax(board, depth - 1, true));
                    board[i] = null;
                }
            }
            return minScore;
        }
    }

    checkWinner(board) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (const [a, b, c] of winPatterns) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }

        return board.includes(null) ? null : 'tie';
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.maxDepth = this.getMaxDepth(difficulty);
    }
} 
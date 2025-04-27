export class AIPlayer {
    constructor(difficulty = 'normal') {
        this.difficulty = difficulty.toLowerCase();
        this.maxDepth = this.getMaxDepth(this.difficulty);
    }

    getMaxDepth(difficulty) {
        switch (difficulty) {
            case 'easy': return 1;
            case 'normal': return 3;
            case 'hard': return 6;
            default: return 3;
        }
    }

    getBestMove(gameEngine) {
        const board = [...gameEngine.getBoardState()];
        const availableMoves = gameEngine.getAvailableMoves();

        if (availableMoves.length === 0) {
            return null;
        }

        // For easy difficulty, make random moves more often (60% chance)
        if (this.difficulty === 'easy' && Math.random() < 0.6) {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        // For normal difficulty, occasionally make suboptimal moves (20% chance)
        if (this.difficulty === 'normal' && Math.random() < 0.2) {
            // Pick a random move that's not the best
            if (availableMoves.length > 1) {
                // First find what would be the best move
                let bestMove = this.findBestMove(board, availableMoves);
                // Then filter it out and pick a random one from the rest
                const suboptimalMoves = availableMoves.filter(move => move !== bestMove);
                return suboptimalMoves[Math.floor(Math.random() * suboptimalMoves.length)];
            }
        }

        // For hard difficulty or when not taking random/suboptimal moves,
        // find the best move using minimax with alpha-beta pruning
        return this.findBestMove(board, availableMoves);
    }

    findBestMove(board, availableMoves) {
        let bestScore = -Infinity;
        let bestMove = availableMoves[0];

        // Add a small random factor for easy/normal to avoid predictable play
        const randomFactor = this.difficulty === 'hard' ? 0 :
            this.difficulty === 'normal' ? 0.5 : 1;

        for (const move of availableMoves) {
            board[move] = 'O'; // AI is always O
            // Use alpha-beta pruning for hard difficulty
            const score = this.difficulty === 'hard'
                ? this.minimax(board, this.maxDepth, -Infinity, Infinity, false)
                : this.minimax(board, this.maxDepth, false) + (Math.random() * randomFactor);
            board[move] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    minimax(board, depth, alpha, beta, isMaximizing) {
        // For hard difficulty, use alpha-beta pruning
        if (this.difficulty === 'hard' && arguments.length === 5) {
            return this.minimaxWithPruning(board, depth, alpha, beta, isMaximizing);
        }

        // For easy/normal, use regular minimax
        isMaximizing = arguments.length === 3 ? arguments[2] : isMaximizing;

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

    minimaxWithPruning(board, depth, alpha, beta, isMaximizing) {
        const result = this.checkWinner(board);

        if (result !== null) {
            return result === 'O' ? 10 : result === 'X' ? -10 : 0;
        }

        if (depth === 0) {
            return this.evaluateBoard(board);
        }

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    maxScore = Math.max(maxScore, this.minimaxWithPruning(board, depth - 1, alpha, beta, false));
                    board[i] = null;
                    alpha = Math.max(alpha, maxScore);
                    if (beta <= alpha) break; // Beta cutoff
                }
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    minScore = Math.min(minScore, this.minimaxWithPruning(board, depth - 1, alpha, beta, true));
                    board[i] = null;
                    beta = Math.min(beta, minScore);
                    if (beta <= alpha) break; // Alpha cutoff
                }
            }
            return minScore;
        }
    }

    // For hard difficulty, add heuristic evaluation for non-terminal states
    evaluateBoard(board) {
        // Simple heuristic: prefer center and corners
        const centerValue = board[4] === 'O' ? 3 : board[4] === 'X' ? -3 : 0;

        // Check corners (0, 2, 6, 8)
        let cornerScore = 0;
        const corners = [0, 2, 6, 8];
        for (const corner of corners) {
            if (board[corner] === 'O') cornerScore += 1;
            else if (board[corner] === 'X') cornerScore -= 1;
        }

        return centerValue + cornerScore;
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
        this.difficulty = difficulty.toLowerCase();
        this.maxDepth = this.getMaxDepth(this.difficulty);
    }
} 
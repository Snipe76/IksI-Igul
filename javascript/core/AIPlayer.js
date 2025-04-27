export class AIPlayer {
    constructor(difficulty = 'normal') {
        this.difficulty = difficulty.toLowerCase();
        this.maxDepth = this.getMaxDepth(this.difficulty);
    }

    getMaxDepth(difficulty) {
        switch (difficulty) {
            case 'easy': return 1;
            case 'normal': return 3;
            case 'hard': return 9; // Unlimited depth for hard - will search entire game tree
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

        // Hard mode uses perfect strategy
        if (this.difficulty === 'hard') {
            return this.getPerfectMove(board, availableMoves);
        }

        // For normal difficulty or when not taking random/suboptimal moves
        return this.findBestMove(board, availableMoves);
    }

    // Perfect play algorithm for Hard difficulty
    getPerfectMove(board, availableMoves) {
        // First move optimizations - if AI goes first, take center or corner
        const moveCount = 9 - availableMoves.length;

        if (moveCount === 0) {
            // If AI goes first, take center
            return 4;
        }

        if (moveCount === 1) {
            // If player took center, take corner
            if (board[4] === 'X') {
                return this.getRandomCorner(availableMoves);
            }
            // If player took a corner or edge, take center if available
            else if (availableMoves.includes(4)) {
                return 4;
            }
        }

        // Check for immediate win
        const winMove = this.findWinningMove(board, 'O');
        if (winMove !== null) {
            return winMove;
        }

        // Block opponent's winning move
        const blockMove = this.findWinningMove(board, 'X');
        if (blockMove !== null) {
            return blockMove;
        }

        // Create a fork (two winning ways)
        const forkMove = this.findForkMove(board, 'O');
        if (forkMove !== null) {
            return forkMove;
        }

        // Block opponent's fork
        const blockForkMove = this.findForkMove(board, 'X');
        if (blockForkMove !== null) {
            return blockForkMove;
        }

        // Take center if available
        if (availableMoves.includes(4)) {
            return 4;
        }

        // Take opposite corner if possible
        const oppositeCornerMove = this.findOppositeCorner(board, availableMoves);
        if (oppositeCornerMove !== null) {
            return oppositeCornerMove;
        }

        // Take any corner
        for (const corner of [0, 2, 6, 8]) {
            if (availableMoves.includes(corner)) {
                return corner;
            }
        }

        // Take any edge
        for (const edge of [1, 3, 5, 7]) {
            if (availableMoves.includes(edge)) {
                return edge;
            }
        }

        // If somehow we get here, use minimax
        return this.findBestMove(board, availableMoves);
    }

    getRandomCorner(availableMoves) {
        const corners = [0, 2, 6, 8].filter(corner => availableMoves.includes(corner));
        return corners[Math.floor(Math.random() * corners.length)];
    }

    findOppositeCorner(board, availableMoves) {
        const oppositeCorners = [[0, 8], [2, 6]];

        for (const [corner1, corner2] of oppositeCorners) {
            if (board[corner1] === 'X' && availableMoves.includes(corner2)) {
                return corner2;
            }
            if (board[corner2] === 'X' && availableMoves.includes(corner1)) {
                return corner1;
            }
        }

        return null;
    }

    findWinningMove(board, player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            // Check if two positions are filled by player and third is empty
            if (board[a] === player && board[b] === player && board[c] === null) {
                return c;
            }
            if (board[a] === player && board[c] === player && board[b] === null) {
                return b;
            }
            if (board[b] === player && board[c] === player && board[a] === null) {
                return a;
            }
        }

        return null;
    }

    findForkMove(board, player) {
        // A fork is a move that creates two winning ways
        const emptySquares = board.map((cell, index) => cell === null ? index : null).filter(index => index !== null);

        for (const square of emptySquares) {
            // Try this move
            board[square] = player;

            // Count potential winning ways after this move
            let winningWays = 0;
            const winPatterns = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
                [0, 4, 8], [2, 4, 6]             // Diagonals
            ];

            for (const pattern of winPatterns) {
                const [a, b, c] = pattern;
                const patternValues = [board[a], board[b], board[c]];

                // Count cells with player's marks
                const playerCount = patternValues.filter(cell => cell === player).length;
                // Count empty cells
                const emptyCount = patternValues.filter(cell => cell === null).length;

                // If two player's marks and one empty, it's a winning way
                if (playerCount === 2 && emptyCount === 1) {
                    winningWays++;
                }
            }

            // Undo the move
            board[square] = null;

            // If this creates two or more winning ways, it's a fork
            if (winningWays >= 2) {
                return square;
            }
        }

        return null;
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
            // Adjust scores to favor quicker wins and delay losses
            if (result === 'O') return 10 + depth; // Win sooner is better
            if (result === 'X') return -10 - depth; // Lose later is better
            return 0; // Draw
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

    // Enhanced board evaluation for Hard difficulty
    evaluateBoard(board) {
        // Evaluate center (most valuable position)
        const centerValue = board[4] === 'O' ? 5 : board[4] === 'X' ? -5 : 0;

        // Evaluate corners (0, 2, 6, 8)
        let cornerScore = 0;
        const corners = [0, 2, 6, 8];
        for (const corner of corners) {
            if (board[corner] === 'O') cornerScore += 3;
            else if (board[corner] === 'X') cornerScore -= 3;
        }

        // Evaluate edges (1, 3, 5, 7)
        let edgeScore = 0;
        const edges = [1, 3, 5, 7];
        for (const edge of edges) {
            if (board[edge] === 'O') edgeScore += 1;
            else if (board[edge] === 'X') edgeScore -= 1;
        }

        // Check for potential winning patterns
        let patternScore = 0;
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (const pattern of winPatterns) {
            patternScore += this.evaluatePattern(board, pattern);
        }

        return centerValue + cornerScore + edgeScore + patternScore;
    }

    evaluatePattern(board, pattern) {
        const [a, b, c] = pattern;
        const values = [board[a], board[b], board[c]];

        const oCount = values.filter(v => v === 'O').length;
        const xCount = values.filter(v => v === 'X').length;
        const emptyCount = values.filter(v => v === null).length;

        // If there's a mix of X and O, pattern has no potential
        if (oCount > 0 && xCount > 0) return 0;

        // Pattern has O's only (potential win for AI)
        if (oCount > 0 && xCount === 0) {
            if (oCount === 2) return 8; // Two O's, high value
            return 2; // One O
        }

        // Pattern has X's only (potential win for player)
        if (xCount > 0 && oCount === 0) {
            if (xCount === 2) return -8; // Block priority
            return -2; // One X
        }

        return 0; // Empty line
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
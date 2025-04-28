import { GAME_CONFIG } from './config.js';

export class AIPlayer {
    constructor(difficulty = GAME_CONFIG.AI.DIFFICULTY_LEVELS.NORMAL.name) {
        this.setDifficulty(difficulty);
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty.toLowerCase();
        const difficultyConfig = Object.values(GAME_CONFIG.AI.DIFFICULTY_LEVELS)
            .find(level => level.name === this.difficulty);

        if (!difficultyConfig) {
            this.difficulty = GAME_CONFIG.AI.DIFFICULTY_LEVELS.NORMAL.name;
            this.maxDepth = GAME_CONFIG.AI.DIFFICULTY_LEVELS.NORMAL.maxDepth;
            return;
        }

        this.maxDepth = difficultyConfig.maxDepth;
    }

    getBestMove(gameEngine) {
        const board = gameEngine.getBoardState();
        const availableMoves = gameEngine.getAvailableMoves();

        if (availableMoves.length === 0) {
            return null;
        }

        const difficultyConfig = GAME_CONFIG.AI.DIFFICULTY_LEVELS[this.difficulty.toUpperCase()];

        // Easy mode: Make random moves more often
        if (this.difficulty === GAME_CONFIG.AI.DIFFICULTY_LEVELS.EASY.name &&
            Math.random() < difficultyConfig.randomMoveChance) {
            return this.getRandomMove(availableMoves);
        }

        // Normal mode: Occasionally make suboptimal moves
        if (this.difficulty === GAME_CONFIG.AI.DIFFICULTY_LEVELS.NORMAL.name &&
            Math.random() < difficultyConfig.suboptimalMoveChance) {
            return this.getSuboptimalMove(board, availableMoves);
        }

        // Hard mode: Use perfect strategy
        if (this.difficulty === GAME_CONFIG.AI.DIFFICULTY_LEVELS.HARD.name) {
            return this.getPerfectMove(board, availableMoves);
        }

        // Default: Use minimax with appropriate depth
        return this.findBestMove(board, availableMoves);
    }

    getRandomMove(availableMoves) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    getSuboptimalMove(board, availableMoves) {
        if (availableMoves.length <= 1) {
            return availableMoves[0];
        }

        const bestMove = this.findBestMove(board, availableMoves);
        const suboptimalMoves = availableMoves.filter(move => move !== bestMove);
        return suboptimalMoves[Math.floor(Math.random() * suboptimalMoves.length)];
    }

    getPerfectMove(board, availableMoves) {
        const moveCount = GAME_CONFIG.BOARD.TOTAL_CELLS - availableMoves.length;

        // First move optimizations
        if (moveCount === 0) {
            return 4; // Center
        }

        if (moveCount === 1) {
            return board[4] === GAME_CONFIG.PLAYERS.X
                ? this.getRandomCorner(availableMoves)
                : (availableMoves.includes(4) ? 4 : this.getRandomCorner(availableMoves));
        }

        // Check for immediate win
        const winMove = this.findWinningMove(board, GAME_CONFIG.PLAYERS.O);
        if (winMove !== null) return winMove;

        // Block opponent's winning move
        const blockMove = this.findWinningMove(board, GAME_CONFIG.PLAYERS.X);
        if (blockMove !== null) return blockMove;

        // Create or block fork
        const forkMove = this.findForkMove(board, GAME_CONFIG.PLAYERS.O);
        if (forkMove !== null) return forkMove;

        const blockForkMove = this.findForkMove(board, GAME_CONFIG.PLAYERS.X);
        if (blockForkMove !== null) return blockForkMove;

        // Take center if available
        if (availableMoves.includes(4)) return 4;

        // Take opposite corner
        const oppositeCornerMove = this.findOppositeCorner(board, availableMoves);
        if (oppositeCornerMove !== null) return oppositeCornerMove;

        // Take any corner
        const cornerMove = this.getFirstAvailableMove(availableMoves, [0, 2, 6, 8]);
        if (cornerMove !== null) return cornerMove;

        // Take any edge
        return this.getFirstAvailableMove(availableMoves, [1, 3, 5, 7]);
    }

    getRandomCorner(availableMoves) {
        const corners = [0, 2, 6, 8].filter(corner => availableMoves.includes(corner));
        return corners[Math.floor(Math.random() * corners.length)];
    }

    getFirstAvailableMove(availableMoves, preferredMoves) {
        for (const move of preferredMoves) {
            if (availableMoves.includes(move)) {
                return move;
            }
        }
        return availableMoves[0];
    }

    findOppositeCorner(board, availableMoves) {
        const oppositeCorners = [[0, 8], [2, 6]];

        for (const [corner1, corner2] of oppositeCorners) {
            if (board[corner1] === GAME_CONFIG.PLAYERS.X && availableMoves.includes(corner2)) {
                return corner2;
            }
            if (board[corner2] === GAME_CONFIG.PLAYERS.X && availableMoves.includes(corner1)) {
                return corner1;
            }
        }

        return null;
    }

    findWinningMove(board, player) {
        for (const pattern of GAME_CONFIG.BOARD.WIN_PATTERNS) {
            const [a, b, c] = pattern;
            const positions = [[a, b, c], [b, c, a], [c, a, b]];

            for (const [pos1, pos2, pos3] of positions) {
                if (board[pos1] === player &&
                    board[pos2] === player &&
                    board[pos3] === null) {
                    return pos3;
                }
            }
        }

        return null;
    }

    findForkMove(board, player) {
        const emptySquares = board
            .map((cell, index) => cell === null ? index : null)
            .filter(index => index !== null);

        for (const square of emptySquares) {
            board[square] = player;
            const winningWays = this.countWinningWays(board, player);
            board[square] = null;

            if (winningWays >= 2) {
                return square;
            }
        }

        return null;
    }

    countWinningWays(board, player) {
        let winningWays = 0;

        for (const pattern of GAME_CONFIG.BOARD.WIN_PATTERNS) {
            const [a, b, c] = pattern;
            const patternValues = [board[a], board[b], board[c]];
            const playerCount = patternValues.filter(cell => cell === player).length;
            const emptyCount = patternValues.filter(cell => cell === null).length;

            if (playerCount === 2 && emptyCount === 1) {
                winningWays++;
            }
        }

        return winningWays;
    }

    findBestMove(board, availableMoves) {
        let bestScore = -Infinity;
        let bestMove = availableMoves[0];

        for (const move of availableMoves) {
            board[move] = GAME_CONFIG.PLAYERS.O;
            const score = this.minimax(board, this.maxDepth, -Infinity, Infinity, false);
            board[move] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    minimax(board, depth, alpha, beta, isMaximizing) {
        const winner = this.checkWinner(board);
        if (winner === GAME_CONFIG.PLAYERS.O) return 10;
        if (winner === GAME_CONFIG.PLAYERS.X) return -10;
        if (!board.includes(null)) return 0;
        if (depth === 0) return this.evaluateBoard(board);

        if (isMaximizing) {
            return this.maximizingMove(board, depth, alpha, beta);
        } else {
            return this.minimizingMove(board, depth, alpha, beta);
        }
    }

    maximizingMove(board, depth, alpha, beta) {
        let maxScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = GAME_CONFIG.PLAYERS.O;
                const score = this.minimax(board, depth - 1, alpha, beta, false);
                board[i] = null;
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
        }
        return maxScore;
    }

    minimizingMove(board, depth, alpha, beta) {
        let minScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = GAME_CONFIG.PLAYERS.X;
                const score = this.minimax(board, depth - 1, alpha, beta, true);
                board[i] = null;
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
        }
        return minScore;
    }

    evaluateBoard(board) {
        let score = 0;
        for (const pattern of GAME_CONFIG.BOARD.WIN_PATTERNS) {
            score += this.evaluatePattern(board, pattern);
        }
        return score;
    }

    evaluatePattern(board, pattern) {
        const [a, b, c] = pattern;
        const line = [board[a], board[b], board[c]];

        const aiCount = line.filter(cell => cell === GAME_CONFIG.PLAYERS.O).length;
        const playerCount = line.filter(cell => cell === GAME_CONFIG.PLAYERS.X).length;
        const emptyCount = line.filter(cell => cell === null).length;

        if (aiCount === 2 && emptyCount === 1) return 5;
        if (playerCount === 2 && emptyCount === 1) return -5;
        if (aiCount === 1 && emptyCount === 2) return 1;
        if (playerCount === 1 && emptyCount === 2) return -1;

        return 0;
    }

    checkWinner(board) {
        // Check all possible winning patterns
        for (const pattern of GAME_CONFIG.BOARD.WIN_PATTERNS) {
            const [a, b, c] = pattern;

            // If all three positions have the same player's mark and are not empty
            if (board[a] &&
                board[a] === board[b] &&
                board[a] === board[c]) {
                return board[a]; // Return the winning player (X or O)
            }
        }

        // No winner found
        return null;
    }
} 
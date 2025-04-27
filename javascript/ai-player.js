class AIPlayer {
    constructor(difficulty = 'normal') {
        this.difficulty = difficulty;
    }

    // Get the best move for the AI
    getBestMove(gameState) {
        const availableMoves = this.getAvailableMoves(gameState);

        if (this.difficulty === 'easy') {
            // Random move for easy difficulty
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        // For normal and hard difficulties, use minimax
        let bestScore = -Infinity;
        let bestMove = null;

        for (let move of availableMoves) {
            const newState = [...gameState];
            newState[move] = 'O';

            const score = this.minimax(newState, 0, false);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    // Minimax algorithm for optimal move calculation
    minimax(gameState, depth, isMaximizing) {
        // Check for terminal states
        const winner = this.checkWinner(gameState);
        if (winner === 'O') return 10 - depth;
        if (winner === 'X') return depth - 10;
        if (this.isBoardFull(gameState)) return 0;

        const availableMoves = this.getAvailableMoves(gameState);

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let move of availableMoves) {
                const newState = [...gameState];
                newState[move] = 'O';
                const score = this.minimax(newState, depth + 1, false);
                bestScore = Math.max(score, bestScore);
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let move of availableMoves) {
                const newState = [...gameState];
                newState[move] = 'X';
                const score = this.minimax(newState, depth + 1, true);
                bestScore = Math.min(score, bestScore);
            }
            return bestScore;
        }
    }

    // Helper functions
    getAvailableMoves(gameState) {
        return gameState.reduce((moves, cell, index) => {
            if (!cell) moves.push(index);
            return moves;
        }, []);
    }

    isBoardFull(gameState) {
        return !gameState.includes(null);
    }

    checkWinner(gameState) {
        const winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];

        for (let [a, b, c] of winningCombos) {
            if (gameState[a] &&
                gameState[a] === gameState[b] &&
                gameState[a] === gameState[c]) {
                return gameState[a];
            }
        }

        return null;
    }
}

// Export the AI player
window.AIPlayer = AIPlayer; 
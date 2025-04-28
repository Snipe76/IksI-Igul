export const GAME_CONFIG = {
    // System
    SYSTEM: {
        STYLESHEET_LOAD_TIMEOUT: 2000,
        LOADING_OVERLAY_FALLBACK_TIMEOUT: 5000
    },

    BOARD: {
        SIZE: 3,
        TOTAL_CELLS: 9,
        WIN_PATTERNS: [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ]
    },

    PLAYERS: {
        X: 'X',
        O: 'O'
    },

    GAME_MODES: {
        PVP: 'pvp',
        PVC: 'pvc'
    },

    AI: {
        DIFFICULTY_LEVELS: {
            EASY: {
                name: 'easy',
                maxDepth: 1,
                randomMoveChance: 0.6
            },
            NORMAL: {
                name: 'normal',
                maxDepth: 3,
                suboptimalMoveChance: 0.2
            },
            HARD: {
                name: 'hard',
                maxDepth: 9,
                perfectPlay: true
            }
        },
        MOVE_DELAY: 500
    },

    UI: {
        ANIMATION: {
            WIN_CELEBRATION_DURATION: 500,
            TIE_ANIMATION_DELAY: 500
        },
        CLASSES: {
            WINNER: 'winner',
            TIE: 'tie',
            TIE_GAME: 'tie-game',
            WIN_CELEBRATION: 'win-celebration'
        },
        ELEMENTS: {
            LOADING_OVERLAY: 'loading-overlay',
            DIFFICULTY_SELECT: 'difficulty',
            VERSION_DISPLAY: 'version'
        }
    }
}; 
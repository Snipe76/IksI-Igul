// Import dependencies
import { GameEngine } from './GameEngine.js';
import { AIPlayer } from './AIPlayer.js';
import { UIController } from '../components/UIController.js';
import { version } from './version.js';
import { GAME_CONFIG } from './config.js';

// Function to display error message
function showError(message, error) {
    console.error('Error occurred:', message, error);
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    removeLoadingState();
}

// Function to remove loading state
function removeLoadingState() {
    const loadingOverlay = document.getElementById(GAME_CONFIG.UI.ELEMENTS.LOADING_OVERLAY);

    if (loadingOverlay) {
        try {
            loadingOverlay.remove();
        } catch (error) {
            console.error('Error removing loading overlay:', error);
            loadingOverlay.style.display = 'none';
        }
    }
}

// Wait for stylesheets to load
async function waitForStylesheets() {
    const links = document.getElementsByTagName('link');
    const stylesheets = Array.from(links).filter(link =>
        link.rel === 'stylesheet' && !isStylesheetLoaded(link.sheet)
    );

    if (stylesheets.length === 0) {
        return;
    }

    return new Promise((resolve) => {
        let loaded = 0;
        const checkLoaded = () => {
            loaded++;
            if (loaded === stylesheets.length) {
                resolve();
            }
        };

        stylesheets.forEach(stylesheet => {
            if (stylesheet.sheet) {
                checkLoaded();
            } else {
                stylesheet.onload = checkLoaded;
                stylesheet.onerror = checkLoaded;
            }
        });

        setTimeout(resolve, GAME_CONFIG.SYSTEM.STYLESHEET_LOAD_TIMEOUT);
    });
}

function isStylesheetLoaded(styleSheet) {
    try {
        return styleSheet.cssRules || styleSheet.rules;
    } catch (e) {
        return false;
    }
}

// Initialize game when DOM is loaded
async function initializeGame() {
    try {
        await waitForStylesheets();

        // Create the game engine
        const gameEngine = new GameEngine();
        if (!gameEngine) {
            throw new Error('Failed to create GameEngine instance');
        }

        // Create AI player with default difficulty
        const difficultySelect = document.getElementById(GAME_CONFIG.UI.ELEMENTS.DIFFICULTY_SELECT);
        const initialDifficulty = difficultySelect ? difficultySelect.value : GAME_CONFIG.AI.DIFFICULTY_LEVELS.NORMAL.name;

        // Create AI player and assign to game engine
        const aiPlayer = new AIPlayer(initialDifficulty);
        if (!aiPlayer) {
            throw new Error('Failed to create AIPlayer instance');
        }
        gameEngine.aiPlayer = aiPlayer;

        // Create UI controller
        const uiController = new UIController(gameEngine);
        if (!uiController) {
            throw new Error('Failed to create UIController instance');
        }

        // Update version display
        const versionElement = document.getElementById(GAME_CONFIG.UI.ELEMENTS.VERSION_DISPLAY);
        if (versionElement) {
            versionElement.textContent = version;
        }

        removeLoadingState();

        console.log('Game initialized successfully - Version', version);
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize game. Please check the console and refresh the page.', error);
    }
}

document.addEventListener('DOMContentLoaded', initializeGame);

// Add a fallback to remove loading overlay after a timeout
setTimeout(() => {
    const loadingOverlay = document.getElementById(GAME_CONFIG.UI.ELEMENTS.LOADING_OVERLAY);
    if (loadingOverlay) {
        console.warn('Loading overlay still present after timeout, forcing removal');
        removeLoadingState();
    }
}, GAME_CONFIG.SYSTEM.LOADING_OVERLAY_FALLBACK_TIMEOUT); 
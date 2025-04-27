// Import dependencies
import { GameEngine } from './GameEngine.js';
import { AIPlayer } from './AIPlayer.js';
import { UIController } from '../components/UIController.js';
import { version } from './version.js';

// Function to display error message
function showError(message, error) {
    console.error('Error occurred:', message, error);
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);

    // Remove loading overlay
    removeLoadingState();
}

// Function to remove loading state
function removeLoadingState() {
    console.log('Attempting to remove loading overlay...');
    const loadingOverlay = document.getElementById('loading-overlay');
    console.log('Loading overlay element:', loadingOverlay);

    if (loadingOverlay) {
        try {
            loadingOverlay.remove();
            console.log('Loading overlay successfully removed');
        } catch (error) {
            console.error('Error removing loading overlay:', error);
            // Fallback: try hiding it
            loadingOverlay.style.display = 'none';
        }
    } else {
        console.warn('Loading overlay not found');
    }
}

// Wait for stylesheets to load
async function waitForStylesheets() {
    console.log('Waiting for stylesheets...');
    return new Promise((resolve) => {
        const links = document.getElementsByTagName('link');
        const stylesheets = Array.from(links).filter(link =>
            link.rel === 'stylesheet' && !isStylesheetLoaded(link.sheet)
        );

        console.log('Stylesheets to load:', stylesheets.length);

        if (stylesheets.length === 0) {
            console.log('No stylesheets to wait for');
            resolve();
            return;
        }

        let loaded = 0;
        const checkLoaded = () => {
            loaded++;
            console.log(`Stylesheet loaded: ${loaded}/${stylesheets.length}`);
            if (loaded === stylesheets.length) {
                console.log('All stylesheets loaded');
                resolve();
            }
        };

        stylesheets.forEach(stylesheet => {
            if (stylesheet.sheet) {
                console.log('Stylesheet already loaded:', stylesheet.href);
                checkLoaded();
            } else {
                console.log('Waiting for stylesheet:', stylesheet.href);
                stylesheet.onload = () => {
                    console.log('Stylesheet loaded:', stylesheet.href);
                    checkLoaded();
                };
                stylesheet.onerror = () => {
                    console.error('Stylesheet failed to load:', stylesheet.href);
                    checkLoaded();
                };
            }
        });

        // Fallback timeout
        setTimeout(() => {
            console.log('Stylesheet loading timed out');
            resolve();
        }, 2000);
    });
}

function isStylesheetLoaded(styleSheet) {
    try {
        return styleSheet.cssRules || styleSheet.rules;
    } catch (e) {
        console.warn('Error checking stylesheet:', e);
        return false;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded');
    try {
        // Wait for stylesheets
        await waitForStylesheets();

        console.log('Creating game components...');

        // Create game engine instance
        const gameEngine = new GameEngine();
        if (!gameEngine) {
            throw new Error('Failed to create GameEngine instance');
        }
        console.log('GameEngine created');

        // Create UI controller instance
        const uiController = new UIController(gameEngine);
        if (!uiController) {
            throw new Error('Failed to create UIController instance');
        }
        console.log('UIController created');

        // Set initial game state
        gameEngine.reset();
        console.log('Game state reset');

        // Initialize AI player with default difficulty
        const difficultySelect = document.getElementById('difficulty');
        const initialDifficulty = difficultySelect ? difficultySelect.value : 'normal';
        gameEngine.aiPlayer = new AIPlayer(initialDifficulty);
        if (!gameEngine.aiPlayer) {
            throw new Error('Failed to create AIPlayer instance');
        }
        console.log('AIPlayer created with difficulty:', initialDifficulty);

        // Update version display
        const versionElement = document.getElementById('version');
        if (versionElement) {
            versionElement.textContent = version;
            console.log('Version updated:', version);
        }

        // Remove loading state
        removeLoadingState();

        // Log successful initialization
        console.log(`Game initialized successfully - Version ${version}`);
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize game. Please check the console and refresh the page.', error);
    }
});

// Add a fallback to remove loading overlay after a timeout
setTimeout(() => {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        console.warn('Loading overlay still present after timeout, forcing removal');
        removeLoadingState();
    }
}, 5000); // 5 second fallback 
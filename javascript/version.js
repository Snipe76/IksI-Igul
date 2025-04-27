// Version information
const versionInfo = {
    major: 1,
    minor: 1,
    patch: 0,
    build: 'release',
    timestamp: new Date().toISOString(),
    branch: 'main'
};

// Function to format the version string
function formatVersion() {
    const { major, minor, patch, build } = versionInfo;
    const shortDate = new Date().toISOString().split('T')[0];
    return `${major}.${minor}.${patch} (${shortDate})`;
}

// Function to update version display
function updateVersionDisplay() {
    const versionElement = document.getElementById('version');
    if (versionElement) {
        versionElement.textContent = formatVersion();

        // Add title with full version info
        const fullInfo = `Version: ${formatVersion()}\nBuild: ${versionInfo.build}\nDate: ${versionInfo.timestamp}`;
        versionElement.title = fullInfo;

        // Add hover styles
        versionElement.style.cursor = 'help';
        versionElement.style.borderBottom = '1px dotted var(--text-muted)';
    }
}

// Function to fetch the latest Git commit info
async function fetchGitInfo() {
    try {
        const response = await fetch('.git/refs/heads/main');
        if (response.ok) {
            const commitHash = await response.text();
            versionInfo.build = commitHash.slice(0, 7); // Short hash
        }
    } catch (error) {
        console.log('Using default version info');
    }
}

// Initialize version info
async function initializeVersion() {
    await fetchGitInfo();
    updateVersionDisplay();
}

// Update version display when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeVersion);

// Export version info for potential use in other scripts
window.versionInfo = versionInfo; 
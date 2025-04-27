// Function to fetch the latest commit hash
async function updateVersion() {
    try {
        const response = await fetch('https://api.github.com/repos/Snipe76/IksI-Igul/commits/main');
        if (response.ok) {
            const data = await response.json();
            const shortHash = data.sha.substring(0, 7);
            const versionElement = document.getElementById('version');
            versionElement.textContent = `1.0.0-${shortHash}`;
        }
    } catch (error) {
        console.log('Failed to fetch version:', error);
    }
}

// Update version when the page loads
document.addEventListener('DOMContentLoaded', updateVersion); 
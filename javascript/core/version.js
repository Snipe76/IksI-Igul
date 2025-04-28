// Version information
export const version = '2.1.0';

// Update version display when module is imported
const versionElement = document.getElementById('version');
if (versionElement) {
    versionElement.textContent = version;
} 
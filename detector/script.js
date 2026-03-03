// Utility to log activities
function logActivity(message, type = 'info') {
    const logContainer = document.getElementById('log-container');
    const entry = document.createElement('div');
    const time = new Date().toLocaleTimeString();
    entry.className = `log-entry ${type}`;
    entry.setAttribute('data-time', time);
    entry.textContent = message;
    logContainer.prepend(entry);
    console.log(`[${time}] ${message}`);
}

// 1. Improved DevTools Detection
let devtoolsOpen = false;

function detectDevTools() {
    const statusDevTools = document.getElementById('status-devtools');
    let detectedThisRound = false;

    // Method 1: Timing check (debugger)
    const startTime = performance.now();
    debugger;
    if (performance.now() - startTime > 100) {
        detectedThisRound = true;
    }

    // Method 2: Resize check (only if not full screen)
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > threshold || heightDiff > threshold) {
        // This is a strong hint if the user isn't just using a very large window border
        detectedThisRound = true;
    }

    // Method 3: Console formatters (Modern Chrome/Firefox)
    const devtools = /./;
    devtools.toString = function() {
        detectedThisRound = true;
        return 'devtools';
    }
    console.log(devtools);

    // Method 4: Getter on object logged to console
    const element = new Image();
    Object.defineProperty(element, 'id', {
        get: function() {
            detectedThisRound = true;
            return 'devtools-detector';
        }
    });
    console.log(element);

    if (detectedThisRound) {
        if (!devtoolsOpen) {
            devtoolsOpen = true;
            statusDevTools.textContent = 'DETECTED';
            statusDevTools.className = 'status negative';
            logActivity('Developer Tools detected!', 'alert');
        }
    } else {
        if (devtoolsOpen) {
            devtoolsOpen = false;
            statusDevTools.textContent = 'Not detected';
            statusDevTools.className = 'status positive';
            logActivity('Developer Tools closed', 'info');
        }
    }
}

// 2. Improved Incognito/Private Mode Detection
async function detectIncognito() {
    const statusIncognito = document.getElementById('status-incognito');
    let isIncognito = false;
    let detectionReasons = [];

    // A. Chrome & Chromium-based (Edge, Brave, etc.)
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        const { quota } = await navigator.storage.estimate();
        // Chrome Incognito quota is usually much smaller (heuristics)
        if (quota < 120000000) {
            isIncognito = true;
            detectionReasons.push('Low storage quota');
        }
    }

    // B. FileSystem API (Legacy but still useful for some browsers)
    if (window.webkitRequestFileSystem) {
        window.webkitRequestFileSystem(window.TEMPORARY, 1, () => {
            // Success in normal mode
        }, () => {
            isIncognito = true; // Fails in incognito
            detectionReasons.push('FileSystem API disabled');
            updateIncognitoStatus(isIncognito, detectionReasons);
        });
    }

    // C. IndexedDB (Firefox & Safari)
    try {
        const db = indexedDB.open("test_incognito");
        db.onerror = () => {
            isIncognito = true;
            detectionReasons.push('IndexedDB access denied');
            updateIncognitoStatus(isIncognito, detectionReasons);
        };
        db.onsuccess = () => {
            // Check if we can actually write
            updateIncognitoStatus(isIncognito, detectionReasons);
        };
    } catch (e) {
        isIncognito = true;
        detectionReasons.push('IndexedDB exception');
        updateIncognitoStatus(isIncognito, detectionReasons);
    }

    // D. Safari specific (Modern)
    if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
        try {
            localStorage.setItem("test_incognito", "1");
            localStorage.removeItem("test_incognito");
        } catch (e) {
            isIncognito = true;
            detectionReasons.push('LocalStorage disabled (Safari)');
        }
    }

    // E. Service Worker check (Firefox)
    if ('serviceWorker' in navigator) {
        // In some browsers/versions, Service Workers are disabled in private mode
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
        } catch (e) {
            isIncognito = true;
            detectionReasons.push('ServiceWorker access denied');
        }
    }

    updateIncognitoStatus(isIncognito, detectionReasons);
}

function updateIncognitoStatus(isIncognito, reasons = []) {
    const statusIncognito = document.getElementById('status-incognito');
    if (isIncognito) {
        statusIncognito.textContent = 'DETECTED';
        statusIncognito.className = 'status negative';
        const reasonStr = reasons.length > 0 ? ` (Reason: ${reasons.join(', ')})` : '';
        logActivity(`Private/Incognito mode detected!${reasonStr}`, 'alert');
    } else {
        statusIncognito.textContent = 'Normal Mode';
        statusIncognito.className = 'status positive';
    }
}

// 3. Click Monitoring
let clickCount = 0;
document.addEventListener('click', (e) => {
    clickCount++;
    const statusClicks = document.getElementById('status-clicks');
    statusClicks.textContent = `${clickCount} Clicks`;
    statusClicks.className = 'status neutral';
    logActivity(`Click at (${e.clientX}, ${e.clientY}) on ${e.target.tagName}`, 'info');
});

// 4. Context Menu Monitoring
document.addEventListener('contextmenu', (e) => {
    const statusContextMenu = document.getElementById('status-contextmenu');
    statusContextMenu.textContent = 'ATTEMPTED';
    statusContextMenu.className = 'status negative';
    logActivity('Right-click context menu attempt blocked/detected!', 'alert');
    // e.preventDefault(); // Uncomment if you want to block it
});

// 5. Keyboard Shortcuts Monitoring
document.addEventListener('keydown', (e) => {
    const statusShortcuts = document.getElementById('status-shortcuts');
    const keyCombo = [];
    if (e.ctrlKey) keyCombo.push('Ctrl');
    if (e.shiftKey) keyCombo.push('Shift');
    if (e.altKey) keyCombo.push('Alt');
    keyCombo.push(e.key);

    const comboStr = keyCombo.join('+');

    // Detect F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    const isInspection = (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
    );

    if (isInspection) {
        statusShortcuts.textContent = `DETECTED: ${comboStr}`;
        statusShortcuts.className = 'status negative';
        logActivity(`Inspection shortcut detected: ${comboStr}`, 'alert');
    } else {
        statusShortcuts.textContent = `Last key: ${comboStr}`;
        statusShortcuts.className = 'status neutral';
    }
});

// 6. Window Focus/Blur Monitoring
window.addEventListener('focus', () => {
    const statusFocus = document.getElementById('status-focus');
    statusFocus.textContent = 'Focused';
    statusFocus.className = 'status positive';
    logActivity('Window focused', 'info');
});

window.addEventListener('blur', () => {
    const statusFocus = document.getElementById('status-focus');
    statusFocus.textContent = 'Blurred (Inactive)';
    statusFocus.className = 'status negative';
    logActivity('Window blurred / focus lost', 'alert');
});

// 7. Screen and Fullscreen Monitoring
window.addEventListener('resize', () => {
    const statusScreen = document.getElementById('status-screen');
    statusScreen.textContent = 'RESIZED';
    statusScreen.className = 'status neutral';
    logActivity(`Window resized to ${window.innerWidth}x${window.innerHeight}`, 'info');
    
    // Reset status after a short delay
    setTimeout(() => {
        if (statusScreen.textContent === 'RESIZED') {
            statusScreen.textContent = 'Stable';
            statusScreen.className = 'status positive';
        }
    }, 2000);
});

document.addEventListener('fullscreenchange', () => {
    const statusScreen = document.getElementById('status-screen');
    if (document.fullscreenElement) {
        statusScreen.textContent = 'FULLSCREEN';
        statusScreen.className = 'status negative';
        logActivity('Entered Fullscreen mode', 'alert');
    } else {
        statusScreen.textContent = 'Stable';
        statusScreen.className = 'status positive';
        logActivity('Exited Fullscreen mode', 'info');
    }
});

// 8. Media/Recording Detection (Permissions & DisplayMedia)
async function monitorMedia() {
    const statusMedia = document.getElementById('status-media');
    
    // Check for Screen Capture (if supported)
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        // We can't actually detect if they ARE recording without asking, 
        // but we can detect if the API is available and if they start it.
        // For security testing, we can monitor visibilitychange which triggers on some recording overlays.
    }

    // Monitor Visibility API for potential overlays
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            logActivity('Page hidden (user switched tab or minimized)', 'info');
        } else {
            logActivity('Page visible again', 'info');
        }
    });
}

// Initial Checks
window.onload = () => {
    logActivity('Security Dashboard Started', 'system');
    detectIncognito();
    monitorMedia();

    // DevTools check is tricky, run it periodically and on resize
    setInterval(detectDevTools, 2000);
    window.addEventListener('resize', detectDevTools);
    detectDevTools();
};

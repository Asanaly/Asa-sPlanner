// Main application initialization and setup

/**
 * Initialize the application
 */
function initializeApp() {
    console.log('🚀 Initializing JI Course Planner...');
    
    // Initialize grid
    initializeGrid();
    
    // Load courses from API
    loadCourses();
    
    // Setup all event listeners
    setupEventListeners();
    
    console.log('✅ Application initialized successfully');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Course list listeners
    setupCourseListListeners();
    
    // Semester tab listeners
    setupSemesterTabs();
    
    // Modal listeners
    setupModalListeners();
    
    // Additional UI listeners
    setupAdditionalListeners();
}

/**
 * Setup additional UI event listeners
 */
function setupAdditionalListeners() {
    // Handle window resize for responsive design
    window.addEventListener('resize', debounce(handleWindowResize, 250));
    
    // Handle beforeunload to warn about unsaved changes
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Handle visibility change for performance optimization
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

/**
 * Handle window resize events
 */
function handleWindowResize() {
    // Recalculate grid dimensions if needed
    const grid = document.getElementById('scheduleGrid');
    if (grid && window.innerWidth <= 768) {
        // Mobile adjustments
        grid.style.gridTemplateColumns = '80px repeat(5, 1fr)';
    } else if (grid) {
        // Desktop adjustments
        grid.style.gridTemplateColumns = '100px repeat(5, 1fr)';
    }
}

/**
 * Handle before unload (warn about unsaved changes)
 * @param {Event} e - Before unload event
 */
function handleBeforeUnload(e) {
    const state = getAppState();
    if (state.currentSchedule && state.currentSchedule.length > 0) {
        const message = 'You have courses in your schedule. Are you sure you want to leave?';
        e.returnValue = message;
        return message;
    }
}

/**
 * Handle visibility change for performance
 */
function handleVisibilityChange() {
    if (document.hidden) {
        // Page is hidden - pause any animations or timers
        console.log('🔇 App paused (tab hidden)');
    } else {
        // Page is visible - resume normal operation
        console.log('🔊 App resumed (tab visible)');
        // Refresh data if needed
        refreshAppData();
    }
}

/**
 * Refresh application data when tab becomes visible
 */
async function refreshAppData() {
    const state = getAppState();
    
    // Only refresh if it's been more than 5 minutes since last load
    const lastRefresh = state.lastRefresh || 0;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (now - lastRefresh > fiveMinutes) {
        console.log('🔄 Refreshing course data...');
        await loadCourses();
        updateAppState({ lastRefresh: now });
    }
}

/**
 * Debounce utility function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show error message to user
 * @param {string} message - Error message
 * @param {string} type - Error type ('error', 'warning', 'info')
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ff6b6b' : type === 'warning' ? '#ffa726' : '#4facfe'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                margin-left: 10px;
                cursor: pointer;
                font-size: 16px;
            ">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Add CSS animations for notifications
 */
function addNotificationStyles() {
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Handle application errors globally
 * @param {Error} error - Error object
 * @param {string} context - Error context
 */
function handleAppError(error, context = 'Unknown') {
    console.error(`❌ Error in ${context}:`, error);
    
    // Show user-friendly error message
    showNotification(
        `Something went wrong in ${context}. Please try refreshing the page.`,
        'error'
    );
    
    // Update app state to show error
    updateAppState({ 
        error: {
            message: error.message,
            context: context,
            timestamp: new Date().toISOString()
        }
    });
}

/**
 * Setup global error handlers
 */
function setupErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        handleAppError(event.reason, 'Unhandled Promise');
        event.preventDefault();
    });
    
    // Handle uncaught errors
    window.addEventListener('error', function(event) {
        handleAppError(event.error, 'Uncaught Error');
    });
}

/**
 * Development helpers (only in development)
 */
function setupDevHelpers() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Add development helpers to window for debugging
        window.dev = {
            getState: getAppState,
            resetState: resetAppState,
            loadCourses: loadCourses,
            exportSchedule: exportSchedule,
            importSchedule: importSchedule,
            showNotification: showNotification
        };
        
        console.log('🔧 Development helpers available at window.dev');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Add notification styles
        addNotificationStyles();
        
        // Setup error handlers
        setupErrorHandlers();
        
        // Setup development helpers
        setupDevHelpers();
        
        // Initialize the main application
        initializeApp();
        
    } catch (error) {
        handleAppError(error, 'App Initialization');
    }
});

// Export main functions to global scope
window.initializeApp = initializeApp;
window.setupEventListeners = setupEventListeners;
window.showNotification = showNotification;
window.handleAppError = handleAppError;
window.debounce = debounce;
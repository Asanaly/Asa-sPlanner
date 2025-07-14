// Global application state management

// Initialize global state
window.AppState = {
    // Core data
    allCourses: [],
    currentSchedule: [],
    currentSemester: 'fall',
    draggedElement: null,
    
    // UI state
    isLoading: false,
    error: null,
    lastRefresh: 0,
    
    // Filters
    filters: {
        search: '',
        showFall: true,
        showSpring: true,
        showSummer: false  // For future V3 support
    },
    
    // Settings
    settings: {
        autoSave: true,
        showConflictWarnings: true,
        compactView: false,
        darkMode: false
    }
};

/**
 * Update application state
 * @param {Object} updates - State updates to apply
 */
function updateAppState(updates) {
    Object.assign(window.AppState, updates);
    
    // Trigger UI updates if needed
    if (updates.allCourses !== undefined) {
        renderCourseList();
    }
    
    if (updates.currentSchedule !== undefined) {
        renderScheduledCourses();
        updateStats();
        showConflictWarnings();
    }
    
    if (updates.currentSemester !== undefined) {
        renderScheduledCourses();
        updateStats();
        showConflictWarnings();
    }
    
    if (updates.filters !== undefined) {
        renderCourseList();
    }
}

/**
 * Get current application state
 * @returns {Object} Current state
 */
function getAppState() {
    return window.AppState;
}

/**
 * Reset application state to initial values
 */
function resetAppState() {
    window.AppState = {
        allCourses: [],
        currentSchedule: [],
        currentSemester: 'fall',
        draggedElement: null,
        isLoading: false,
        error: null,
        lastRefresh: 0,
        filters: {
            search: '',
            showFall: true,
            showSpring: true,
            showSummer: false
        },
        settings: {
            autoSave: true,
            showConflictWarnings: true,
            compactView: false,
            darkMode: false
        }
    };
    
    // Reset course colors
    if (window.resetCourseColors) {
        window.resetCourseColors();
    }
    
    // Update UI
    renderCourseList();
    renderScheduledCourses();
    updateStats();
}

/**
 * Add course to schedule
 * @param {Object} course - Course object
 * @param {string} semester - Semester
 * @param {number} year - Year
 */
function addCourseToState(course, semester, year) {
    const scheduleItem = {
        course: course,
        semester: semester || window.AppState.currentSemester,
        year: year || (semester === 'fall' ? 2025 : 2026)
    };
    
    window.AppState.currentSchedule.push(scheduleItem);
    updateAppState({ currentSchedule: window.AppState.currentSchedule });
    
    // Auto-save if enabled
    if (window.AppState.settings.autoSave) {
        saveStateToStorage();
    }
}

/**
 * Remove course from schedule
 * @param {number} courseId - Course ID to remove
 */
function removeCourseFromState(courseId) {
    window.AppState.currentSchedule = window.AppState.currentSchedule.filter(
        item => item.course.id !== courseId
    );
    updateAppState({ currentSchedule: window.AppState.currentSchedule });
    
    // Auto-save if enabled
    if (window.AppState.settings.autoSave) {
        saveStateToStorage();
    }
}

/**
 * Check if course is already scheduled
 * @param {number} courseId - Course ID
 * @returns {boolean} True if course is scheduled
 */
function isCourseScheduled(courseId) {
    return window.AppState.currentSchedule.some(item => item.course.id === courseId);
}

/**
 * Get courses for current semester
 * @returns {Array} Courses scheduled for current semester
 */
function getCurrentSemesterCourses() {
    return window.AppState.currentSchedule.filter(
        item => item.semester === window.AppState.currentSemester
    );
}

/**
 * Get courses for specific semester
 * @param {string} semester - Semester name
 * @returns {Array} Courses scheduled for specified semester
 */
function getSemesterCourses(semester) {
    return window.AppState.currentSchedule.filter(
        item => item.semester === semester
    );
}

/**
 * Update filters
 * @param {Object} filterUpdates - Filter updates
 */
function updateFilters(filterUpdates) {
    Object.assign(window.AppState.filters, filterUpdates);
    updateAppState({ filters: window.AppState.filters });
}

/**
 * Update settings
 * @param {Object} settingUpdates - Setting updates
 */
function updateSettings(settingUpdates) {
    Object.assign(window.AppState.settings, settingUpdates);
    updateAppState({ settings: window.AppState.settings });
    
    // Apply settings changes
    applySettings();
}

/**
 * Apply current settings to the UI
 */
function applySettings() {
    const settings = window.AppState.settings;
    
    // Apply dark mode
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Apply compact view
    if (settings.compactView) {
        document.body.classList.add('compact-view');
    } else {
        document.body.classList.remove('compact-view');
    }
}

/**
 * Save state to localStorage
 */
function saveStateToStorage() {
    try {
        const stateToSave = {
            currentSchedule: window.AppState.currentSchedule,
            currentSemester: window.AppState.currentSemester,
            filters: window.AppState.filters,
            settings: window.AppState.settings,
            courseColors: window.getAllCourseColors ? Array.from(window.getAllCourseColors().entries()) : [],
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('jiCoursePlannerState', JSON.stringify(stateToSave));
        console.log('💾 State saved to localStorage');
    } catch (error) {
        console.warn('⚠️ Could not save state to localStorage:', error);
    }
}

/**
 * Load state from localStorage
 * @returns {boolean} True if state was loaded successfully
 */
function loadStateFromStorage() {
    try {
        const savedState = localStorage.getItem('jiCoursePlannerState');
        if (!savedState) return false;
        
        const state = JSON.parse(savedState);
        
        // Restore state
        updateAppState({
            currentSchedule: state.currentSchedule || [],
            currentSemester: state.currentSemester || 'fall',
            filters: { ...window.AppState.filters, ...state.filters },
            settings: { ...window.AppState.settings, ...state.settings }
        });
        
        // Restore course colors
        if (state.courseColors && window.setCourseColor) {
            state.courseColors.forEach(([courseCode, color]) => {
                window.setCourseColor(courseCode, color);
            });
        }
        
        // Apply settings
        applySettings();
        
        console.log('📂 State loaded from localStorage');
        return true;
    } catch (error) {
        console.warn('⚠️ Could not load state from localStorage:', error);
        return false;
    }
}

/**
 * Clear saved state from localStorage
 */
function clearSavedState() {
    try {
        localStorage.removeItem('jiCoursePlannerState');
        console.log('🗑️ Saved state cleared from localStorage');
    } catch (error) {
        console.warn('⚠️ Could not clear saved state:', error);
    }
}

/**
 * Get state statistics
 * @returns {Object} State statistics
 */
function getStateStats() {
    const state = window.AppState;
    return {
        totalCourses: state.allCourses.length,
        scheduledCourses: state.currentSchedule.length,
        semesterBreakdown: {
            fall: getSemesterCourses('fall').length,
            spring: getSemesterCourses('spring').length,
            summer: getSemesterCourses('summer').length
        },
        filtersActive: Object.values(state.filters).some(filter => 
            typeof filter === 'string' ? filter.length > 0 : !filter
        ),
        lastUpdate: state.lastRefresh ? new Date(state.lastRefresh).toLocaleString() : 'Never'
    };
}

/**
 * Validate state integrity
 * @returns {Object} Validation results
 */
function validateState() {
    const state = window.AppState;
    const issues = [];
    
    // Check for duplicate courses in schedule
    const courseIds = state.currentSchedule.map(item => item.course.id);
    const duplicates = courseIds.filter((id, index) => courseIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
        issues.push(`Duplicate courses in schedule: ${duplicates.join(', ')}`);
    }
    
    // Check for invalid semester values
    const validSemesters = ['fall', 'spring', 'summer'];
    state.currentSchedule.forEach(item => {
        if (!validSemesters.includes(item.semester)) {
            issues.push(`Invalid semester: ${item.semester} for course ${item.course.code}`);
        }
    });
    
    // Check current semester validity
    if (!validSemesters.includes(state.currentSemester)) {
        issues.push(`Invalid current semester: ${state.currentSemester}`);
    }
    
    return {
        isValid: issues.length === 0,
        issues: issues
    };
}

// Export functions to global scope
window.updateAppState = updateAppState;
window.getAppState = getAppState;
window.resetAppState = resetAppState;
window.addCourseToState = addCourseToState;
window.removeCourseFromState = removeCourseFromState;
window.isCourseScheduled = isCourseScheduled;
window.getCurrentSemesterCourses = getCurrentSemesterCourses;
window.getSemesterCourses = getSemesterCourses;
window.updateFilters = updateFilters;
window.updateSettings = updateSettings;
window.applySettings = applySettings;
window.saveStateToStorage = saveStateToStorage;
window.loadStateFromStorage = loadStateFromStorage;
window.clearSavedState = clearSavedState;
window.getStateStats = getStateStats;
window.validateState = validateState;
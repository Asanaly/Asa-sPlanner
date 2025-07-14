// Course color management utilities

/**
 * Get or assign a color for a course
 * @param {string} courseCode - Course code
 * @returns {string} CSS gradient color
 */
function getCourseColor(courseCode) {
    if (!window.courseColorMap) {
        window.courseColorMap = new Map();
    }
    
    if (!window.courseColorMap.has(courseCode)) {
        const colorIndex = window.courseColorMap.size % window.CONFIG.COURSE_COLORS.length;
        window.courseColorMap.set(courseCode, window.CONFIG.COURSE_COLORS[colorIndex]);
    }
    
    return window.courseColorMap.get(courseCode);
}

/**
 * Reset all course color assignments
 */
function resetCourseColors() {
    if (window.courseColorMap) {
        window.courseColorMap.clear();
    }
}

/**
 * Get all assigned course colors
 * @returns {Map} Map of course codes to colors
 */
function getAllCourseColors() {
    return window.courseColorMap || new Map();
}

/**
 * Set a specific color for a course
 * @param {string} courseCode - Course code
 * @param {string} color - CSS color value
 */
function setCourseColor(courseCode, color) {
    if (!window.courseColorMap) {
        window.courseColorMap = new Map();
    }
    window.courseColorMap.set(courseCode, color);
}

/**
 * Generate a random color gradient
 * @returns {string} CSS gradient
 */
function generateRandomColor() {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe',
        '#43e97b', '#38f9d7', '#fa709a', '#fee140', '#a8edea', '#fed6e3'
    ];
    
    const color1 = colors[Math.floor(Math.random() * colors.length)];
    const color2 = colors[Math.floor(Math.random() * colors.length)];
    
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
}

// Export functions to global scope
window.getCourseColor = getCourseColor;
window.resetCourseColors = resetCourseColors;
window.getAllCourseColors = getAllCourseColors;
window.setCourseColor = setCourseColor;
window.generateRandomColor = generateRandomColor;
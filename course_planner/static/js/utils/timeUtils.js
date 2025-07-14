// Time calculation and validation utilities

/**
 * Convert time string to minutes since midnight
 * @param {string} timeStr - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Check if course time overlaps with or contains cell time
 * @param {string} courseStart - Course start time
 * @param {string} courseEnd - Course end time
 * @param {string} cellStart - Cell start time
 * @param {string} cellEnd - Cell end time
 * @returns {boolean} True if times overlap
 */
function timeOverlapsOrContained(courseStart, courseEnd, cellStart, cellEnd) {
    const cs = timeToMinutes(courseStart);
    const ce = timeToMinutes(courseEnd);
    const cls = timeToMinutes(cellStart);
    const cle = timeToMinutes(cellEnd);
    
    // Check if course time overlaps with this specific cell time
    return !(ce <= cls || cs >= cle);
}

/**
 * Validate if time slots are within grid boundaries
 * @param {Array} timeSlots - Array of time slot objects
 * @returns {Array} Valid time slots within grid bounds
 */
function validateTimeSlots(timeSlots) {
    return timeSlots.filter(slot => {
        const startMin = timeToMinutes(slot.start);
        const endMin = timeToMinutes(slot.end);
        const gridStartMin = timeToMinutes('08:00');
        const gridEndMin = timeToMinutes('22:00');
        
        return startMin >= gridStartMin && endMin <= gridEndMin;
    });
}

/**
 * Calculate course duration in minutes
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {number} Duration in minutes
 */
function calculateDuration(startTime, endTime) {
    return timeToMinutes(endTime) - timeToMinutes(startTime);
}

/**
 * Format minutes back to time string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time in HH:MM format
 */
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Get current academic year semesters with dynamic years
 * @returns {Object} Object with semester labels and years
 */
function getCurrentAcademicSemesters() {
    const currentYear = new Date().getFullYear();
    
    return {
        fall: `Fall ${currentYear}`,
        spring: `Spring ${currentYear}`,
        summer: `Summer ${currentYear}`
    };
}

// Export to global scope
window.getCurrentAcademicSemesters = getCurrentAcademicSemesters;
window.timeToMinutes = timeToMinutes;
window.timeOverlapsOrContained = timeOverlapsOrContained;
window.validateTimeSlots = validateTimeSlots;
window.calculateDuration = calculateDuration;
window.minutesToTime = minutesToTime;
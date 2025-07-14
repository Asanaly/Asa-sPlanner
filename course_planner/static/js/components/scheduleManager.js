// Schedule management functions

/**
 * Add course to schedule with validation
 * @param {Object} course - Course object
 */
async function addCourseToSchedule(course) {
    const state = getAppState();
    
    // Validate time slots are within grid bounds
    const validTimeSlots = validateTimeSlots(course.time_slots);
    
    if (validTimeSlots.length === 0) {
        alert(`Course ${course.code} has time slots outside the schedule grid (8:00-22:00).`);
        return;
    }

    // Check for conflicts
    const currentCourseIds = getCurrentSemesterCourses().map(s => s.course.id);
    const conflicts = await checkScheduleConflicts([...currentCourseIds, course.id]);
    
    if (conflicts.length > 0) {
        const conflictMessages = conflicts.map(c => 
            `${c.course1} conflicts with ${c.course2} on ${c.day}`
        ).join('\n');
        
        if (!confirm(`Warning: Schedule conflicts detected:\n${conflictMessages}\n\nDo you want to add this course anyway?`)) {
            return;
        }
    }
    
    // Add to state
    addCourseToState(course, state.currentSemester);
}

/**
 * Remove course from schedule
 * @param {number} courseId - Course ID to remove
 */
function removeCourseFromSchedule(courseId) {
    removeCourseFromState(courseId);
}

/**
 * Update schedule statistics
 */
function updateStats() {
    const semesterCourses = getCurrentSemesterCourses();
    
    const totalCredits = semesterCourses.reduce((sum, item) => sum + item.course.credits, 0);
    const totalCourses = semesterCourses.length;
    const avgDifficulty = totalCourses > 0 ? 
        (semesterCourses.reduce((sum, item) => sum + item.course.difficulty_level, 0) / totalCourses).toFixed(1) : 0;
    const totalWorkload = semesterCourses.reduce((sum, item) => sum + item.course.workload_hours, 0);
    
    // Update DOM elements
    const totalCreditsEl = document.getElementById('totalCredits');
    const totalCoursesEl = document.getElementById('totalCourses');
    const avgDifficultyEl = document.getElementById('avgDifficulty');
    const totalWorkloadEl = document.getElementById('totalWorkload');
    
    if (totalCreditsEl) totalCreditsEl.textContent = totalCredits;
    if (totalCoursesEl) totalCoursesEl.textContent = totalCourses;
    if (avgDifficultyEl) avgDifficultyEl.textContent = avgDifficulty;
    if (totalWorkloadEl) totalWorkloadEl.textContent = totalWorkload;
}

/**
 * Show conflict warnings in UI
 */
async function showConflictWarnings() {
    const warningsDiv = document.getElementById('conflictWarnings');
    if (!warningsDiv) return;
    
    const semesterCourses = getCurrentSemesterCourses();
    const courseIds = semesterCourses.map(item => item.course.id);
    
    const conflicts = await checkScheduleConflicts(courseIds);
    
    if (conflicts.length > 0) {
        warningsDiv.innerHTML = conflicts.map(conflict => 
            `<div class="conflict-warning">
                ⚠️ ${conflict.course1} conflicts with ${conflict.course2} on ${conflict.day}
            </div>`
        ).join('');
    } else {
        warningsDiv.innerHTML = '';
    }
}

/**
 * Get schedule summary for current semester
 * @returns {Object} Schedule summary
 */
function getScheduleSummary() {
    const semesterCourses = getCurrentSemesterCourses();
    
    return {
        totalCredits: semesterCourses.reduce((sum, item) => sum + item.course.credits, 0),
        totalCourses: semesterCourses.length,
        avgDifficulty: semesterCourses.length > 0 ? 
            (semesterCourses.reduce((sum, item) => sum + item.course.difficulty_level, 0) / semesterCourses.length) : 0,
        totalWorkload: semesterCourses.reduce((sum, item) => sum + item.course.workload_hours, 0),
        courses: semesterCourses.map(item => ({
            code: item.course.code,
            name: item.course.name,
            credits: item.course.credits,
            difficulty: item.course.difficulty_level,
            workload: item.course.workload_hours
        }))
    };
}

/**
 * Export schedule data
 * @param {string} format - Export format ('json', 'csv')
 * @returns {string} Exported data
 */
function exportSchedule(format = 'json') {
    const state = getAppState();
    const summary = getScheduleSummary();
    
    if (format === 'json') {
        return JSON.stringify({
            semester: state.currentSemester,
            summary: summary,
            fullSchedule: state.currentSchedule
        }, null, 2);
    } else if (format === 'csv') {
        const headers = ['Course Code', 'Course Name', 'Credits', 'Difficulty', 'Workload Hours'];
        const rows = summary.courses.map(course => [
            course.code,
            course.name,
            course.credits,
            course.difficulty,
            course.workload
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return '';
}

/**
 * Import schedule data
 * @param {string} data - JSON data to import
 * @returns {boolean} Success status
 */
function importSchedule(data) {
    try {
        const scheduleData = JSON.parse(data);
        
        if (scheduleData.fullSchedule && Array.isArray(scheduleData.fullSchedule)) {
            updateAppState({ 
                currentSchedule: scheduleData.fullSchedule,
                currentSemester: scheduleData.semester || 'fall'
            });
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error importing schedule:', error);
        return false;
    }
}

/**
 * Clear current semester schedule
 */
function clearCurrentSemester() {
    const state = getAppState();
    const otherSemesterCourses = state.currentSchedule.filter(
        item => item.semester !== state.currentSemester
    );
    
    updateAppState({ currentSchedule: otherSemesterCourses });
}

/**
 * Clear all schedules
 */
function clearAllSchedules() {
    if (confirm('Are you sure you want to clear all schedules? This action cannot be undone.')) {
        updateAppState({ currentSchedule: [] });
        resetCourseColors();
    }
}

// Export functions to global scope
window.addCourseToSchedule = addCourseToSchedule;
window.removeCourse
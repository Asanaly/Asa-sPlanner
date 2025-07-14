// API communication functions

/**
 * Load all courses from the API
 */
async function loadCourses() {
    try {
        updateAppState({ isLoading: true, error: null });
        
        const response = await fetch('/api/courses/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        updateAppState({ 
            allCourses: data.courses,
            isLoading: false 
        });
        
    } catch (error) {
        console.error('Error loading courses:', error);
        updateAppState({ 
            error: 'Failed to load courses',
            isLoading: false 
        });
    }
}

/**
 * Get detailed course information
 * @param {number} courseId - Course ID
 * @returns {Object} Course details
 */
async function getCourseDetails(courseId) {
    try {
        const response = await fetch(`/api/courses/${courseId}/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading course details:', error);
        throw error;
    }
}

/**
 * Check for schedule conflicts
 * @param {Array} courseIds - Array of course IDs
 * @returns {Array} Array of conflicts
 */
async function checkScheduleConflicts(courseIds) {
    if (courseIds.length < 2) return [];
    
    try {
        const response = await fetch(`/api/conflicts/?course_ids=${courseIds.join(',')}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.conflicts || [];
    } catch (error) {
        console.error('Error checking conflicts:', error);
        return [];
    }
}

/**
 * Get user's schedule (requires authentication)
 * @returns {Array} User's schedule
 */
async function getUserSchedule() {
    try {
        const response = await fetch('/api/schedule/');
        if (!response.ok) {
            if (response.status === 302) {
                console.log('User not authenticated');
                return [];
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.schedule || [];
    } catch (error) {
        console.error('Error loading user schedule:', error);
        return [];
    }
}

/**
 * Add course to user's schedule (requires authentication)
 * @param {Object} courseData - Course data to add
 * @returns {Object} API response
 */
async function addCourseToSchedule(courseData) {
    try {
        const response = await fetch('/api/schedule/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(courseData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error adding course to schedule:', error);
        throw error;
    }
}

/**
 * Remove course from user's schedule (requires authentication)
 * @param {number} scheduleId - Schedule entry ID
 * @returns {Object} API response
 */
async function removeCourseFromSchedule(scheduleId) {
    try {
        const response = await fetch(`/api/schedule/remove/${scheduleId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error removing course from schedule:', error);
        throw error;
    }
}

/**
 * Get CSRF token for API requests
 * @returns {string} CSRF token
 */
function getCSRFToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue || '';
}

/**
 * Generic API request function
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Object} Response data
 */
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
            ...options.headers
        }
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// Export functions to global scope
window.loadCourses = loadCourses;
window.getCourseDetails = getCourseDetails;
window.checkScheduleConflicts = checkScheduleConflicts;
window.getUserSchedule = getUserSchedule;
window.addCourseToScheduleAPI = addCourseToSchedule;
window.removeCourseFromScheduleAPI = removeCourseFromSchedule;
window.getCSRFToken = getCSRFToken;
window.apiRequest = apiRequest;
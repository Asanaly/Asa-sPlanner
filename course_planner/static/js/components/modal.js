// Modal and popup functionality

/**
 * Show course details in modal
 * @param {number} courseId - Course ID
 */
async function showCourseDetails(courseId) {
    try {
        const course = await getCourseDetails(courseId);
        
        document.getElementById('modalCourseTitle').textContent = `${course.code} - ${course.name}`;
        
        const modalContent = document.getElementById('modalCourseContent');
        modalContent.innerHTML = generateCourseDetailsHTML(course);
        
        document.getElementById('courseModal').classList.add('show');
        
    } catch (error) {
        console.error('Error loading course details:', error);
        alert('Error loading course details. Please try again.');
    }
}

/**
 * Generate HTML for course details modal
 * @param {Object} course - Course data
 * @returns {string} HTML content
 */
function generateCourseDetailsHTML(course) {
    return `
        <div class="course-stats">
            <div class="course-stat">
                <div class="course-stat-value">${course.credits}</div>
                <div class="course-stat-label">Credits</div>
            </div>
            <div class="course-stat">
                <div class="course-stat-value">${course.difficulty_level}/5</div>
                <div class="course-stat-label">Difficulty</div>
            </div>
            <div class="course-stat">
                <div class="course-stat-value">${course.workload_hours}h</div>
                <div class="course-stat-label">Per Week</div>
            </div>
            <div class="course-stat">
                <div class="course-stat-value">${course.available_semesters.join(', ')}</div>
                <div class="course-stat-label">Available</div>
            </div>
        </div>
        
        <div class="modal-section">
            <h3>📚 Description</h3>
            <p>${course.description || 'No description available.'}</p>
        </div>
        
        <div class="modal-section">
            <h3>🕒 Schedule</h3>
            <div class="time-schedule">
                ${course.time_slots.map(slot => 
                    `<div class="time-slot-item">
                        <strong>${slot.day}</strong>: ${slot.start} - ${slot.end}
                    </div>`
                ).join('')}
            </div>
        </div>
        
        ${course.prerequisites && course.prerequisites.length > 0 ? `
            <div class="modal-section">
                <h3>📋 Prerequisites</h3>
                <div class="prerequisites-list">
                    ${course.prerequisites.map(prereq => 
                        `<span class="prerequisite-tag" onclick="navigateToCourse('${prereq}')">${prereq}</span>`
                    ).join('')}
                </div>
            </div>
        ` : ''}
        
        <div class="modal-section">
            <h3>👨‍🏫 Instructor Information</h3>
            <p><em>Instructor details will be available in future updates.</em></p>
        </div>
        
        <div class="modal-section">
            <h3>📝 Additional Information</h3>
            <p>• Course materials and syllabus will be available after enrollment</p>
            <p>• Office hours and TA information will be posted on course website</p>
            <p>• Check course website for the most up-to-date information</p>
        </div>
    `;
}

/**
 * Close the course details modal
 */
function closeModal() {
    document.getElementById('courseModal').classList.remove('show');
}

/**
 * Navigate to prerequisite course details
 * @param {string} courseCode - Course code
 */
function navigateToCourse(courseCode) {
    const state = getAppState();
    const course = state.allCourses.find(c => c.code === courseCode);
    if (course) {
        closeModal();
        setTimeout(() => showCourseDetails(course.id), window.CONFIG.ANIMATIONS.MODAL_TRANSITION);
    } else {
        alert(`Course ${courseCode} not found in the current course list.`);
    }
}

/**
 * Show prerequisites popup
 * @param {string} courseCode - Course code
 * @param {Event} event - Click event
 */
function showPrerequisites(courseCode, event) {
    event.stopPropagation();
    
    const state = getAppState();
    const course = state.allCourses.find(c => c.code === courseCode);
    if (!course || !course.prerequisites || course.prerequisites.length === 0) {
        return;
    }
    
    // Get all prerequisites recursively
    const allPrereqs = getAllPrerequisites(courseCode, new Set());
    
    const prereqList = Array.from(allPrereqs).map(prereq => {
        return `<span class="prerequisite-tag" onclick="highlightCourseInList('${prereq}');">${prereq}</span>`;
    }).join('');
    
    // Position popup to the side to avoid blocking view
    const rect = event.target.getBoundingClientRect();
    const isLeftSide = rect.left < window.innerWidth / 2;
    const popupLeft = isLeftSide ? rect.right + 10 : rect.left - 410;
    
    const popup = createPrerequisitesPopup(courseCode, prereqList, rect.top, popupLeft);
    document.body.appendChild(popup);
}

/**
 * Create prerequisites popup element
 * @param {string} courseCode - Course code
 * @param {string} prereqList - HTML for prerequisite list
 * @param {number} top - Top position
 * @param {number} left - Left position
 * @returns {HTMLElement} Popup element
 */
function createPrerequisitesPopup(courseCode, prereqList, top, left) {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed; 
        top: ${top}px; 
        left: ${left}px; 
        background: white; 
        padding: 20px; 
        border-radius: 10px; 
        box-shadow: 0 10px 25px rgba(0,0,0,0.3); 
        z-index: 1000; 
        max-width: 400px;
    `;
    
    popup.innerHTML = `
        <h3 style="margin-top: 0; color: #667eea;">All Prerequisites for ${courseCode}</h3>
        <div class="prerequisites-list">${prereqList}</div>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 15px; 
            padding: 8px 16px; 
            background: #667eea; 
            color: white; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer;
        ">Close</button>
    `;
    
    return popup;
}

/**
 * Get all prerequisites recursively
 * @param {string} courseCode - Course code
 * @param {Set} visited - Visited courses (for circular dependency detection)
 * @returns {Set} Set of all prerequisite course codes
 */
function getAllPrerequisites(courseCode, visited = new Set()) {
    if (visited.has(courseCode)) {
        return new Set(); // Avoid infinite loops
    }
    
    visited.add(courseCode);
    const state = getAppState();
    const course = state.allCourses.find(c => c.code === courseCode);
    const allPrereqs = new Set();
    
    if (course && course.prerequisites) {
        course.prerequisites.forEach(prereq => {
            allPrereqs.add(prereq);
            // Recursively get prerequisites of prerequisites
            const nestedPrereqs = getAllPrerequisites(prereq, new Set(visited));
            nestedPrereqs.forEach(nested => allPrereqs.add(nested));
        });
    }
    
    return allPrereqs;
}

/**
 * Setup modal event listeners
 */
function setupModalListeners() {
    // Close modal when clicking outside
    const modal = document.getElementById('courseModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

/**
 * Show generic popup with custom content
 * @param {string} title - Popup title
 * @param {string} content - Popup content HTML
 * @param {Object} options - Popup options
 */
function showPopup(title, content, options = {}) {
    const popup = document.createElement('div');
    popup.className = 'custom-popup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: ${options.maxWidth || '400px'};
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    popup.innerHTML = `
        <h3 style="margin-top: 0; color: #667eea;">${title}</h3>
        <div>${content}</div>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 15px;
            padding: 8px 16px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        ">Close</button>
    `;
    
    document.body.appendChild(popup);
    
    // Auto-remove after specified time
    if (options.autoClose) {
        setTimeout(() => {
            if (popup.parentElement) {
                popup.remove();
            }
        }, options.autoClose);
    }
}

// Export functions to global scope
window.showCourseDetails = showCourseDetails;
window.generateCourseDetailsHTML = generateCourseDetailsHTML;
window.closeModal = closeModal;
window.navigateToCourse = navigateToCourse;
window.showPrerequisites = showPrerequisites;
window.createPrerequisitesPopup = createPrerequisitesPopup;
window.getAllPrerequisites = getAllPrerequisites;
window.setupModalListeners = setupModalListeners;
window.showPopup = showPopup;
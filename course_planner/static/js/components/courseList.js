// Course list rendering and filtering

/**
 * Render the course list in sidebar
 */
function renderCourseList() {
    const courseList = document.getElementById('courseList');
    const state = getAppState();
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const showFall = document.getElementById('fallFilter').checked;
    const showSpring = document.getElementById('springFilter').checked;
    
    courseList.innerHTML = '';
    
    const filteredCourses = state.allCourses.filter(course => {
        const matchesSearch = course.code.toLowerCase().includes(searchTerm) || 
                            course.name.toLowerCase().includes(searchTerm);
        const matchesSemester = (showFall && course.available_semesters.includes('fall')) ||
                              (showSpring && course.available_semesters.includes('spring'));
        return matchesSearch && matchesSemester;
    });
    
    filteredCourses.forEach(course => {
        const courseItem = createCourseItem(course);
        courseList.appendChild(courseItem);
    });
}

/**
 * Create a course item element
 * @param {Object} course - Course data
 * @returns {HTMLElement} Course item element
 */
function createCourseItem(course) {
    const courseItem = document.createElement('div');
    courseItem.className = 'course-item';
    courseItem.dataset.courseId = course.id;
    
    // Check if course is already scheduled
    const isScheduled = isCourseScheduled(course.id);
    if (isScheduled) {
        courseItem.classList.add('disabled');
    } else {
        courseItem.draggable = true;
    }
    
    courseItem.innerHTML = `
        <div class="course-code" onclick="showCourseDetails(${course.id})">${course.code}</div>
        <div class="course-name">${course.name}</div>
        <div class="course-credits">${course.credits} credits</div>
        <div class="difficulty-indicator">
            ${'★'.repeat(course.difficulty_level)}${'☆'.repeat(5-course.difficulty_level)}
        </div>
        ${course.prerequisites && course.prerequisites.length > 0 ? 
            `<span class="prerequisites-link" onclick="showPrerequisites('${course.code}', event)">Prerequisites: ${course.prerequisites.join(', ')}</span>` 
            : ''}
    `;
    
    // Only add drag listeners if not disabled
    if (!isScheduled) {
        courseItem.addEventListener('dragstart', handleDragStart);
    }
    
    return courseItem;
}

/**
 * Highlight a course in the list
 * @param {string} courseCode - Course code to highlight
 */
function highlightCourseInList(courseCode) {
    // Clear previous highlights
    document.querySelectorAll('.course-item').forEach(item => {
        item.classList.remove('highlight-found');
    });
    
    // Find and highlight the target course
    const courseItems = document.querySelectorAll('.course-item');
    let found = false;
    
    courseItems.forEach(item => {
        const codeElement = item.querySelector('.course-code');
        if (codeElement && codeElement.textContent.trim() === courseCode) {
            found = true;
            
            // Scroll to the course
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add highlight class
            item.classList.add('highlight-found');
            
            // Remove highlight after duration from config
            setTimeout(() => {
                item.classList.remove('highlight-found');
            }, window.CONFIG.ANIMATIONS.HIGHLIGHT_DURATION);
        }
    });
    
    if (!found) {
        alert(`Course ${courseCode} is not visible in the current filtered list. Try adjusting your filters.`);
    }
}

/**
 * Filter courses by search term
 * @param {string} searchTerm - Search term
 */
function filterCoursesBySearch(searchTerm) {
    updateFilters({ search: searchTerm });
    renderCourseList();
}

/**
 * Filter courses by semester
 * @param {string} semester - Semester name
 * @param {boolean} show - Whether to show courses for this semester
 */
function filterCoursesBySemester(semester, show) {
    const filterUpdate = {};
    filterUpdate[`show${semester.charAt(0).toUpperCase() + semester.slice(1)}`] = show;
    updateFilters(filterUpdate);
    renderCourseList();
}

/**
 * Get filtered courses based on current filters
 * @returns {Array} Filtered courses
 */
function getFilteredCourses() {
    const state = getAppState();
    const searchTerm = state.filters.search.toLowerCase();
    
    return state.allCourses.filter(course => {
        const matchesSearch = course.code.toLowerCase().includes(searchTerm) || 
                            course.name.toLowerCase().includes(searchTerm);
        const matchesSemester = (state.filters.showFall && course.available_semesters.includes('fall')) ||
                              (state.filters.showSpring && course.available_semesters.includes('spring'));
        return matchesSearch && matchesSemester;
    });
}

/**
 * Setup course list event listeners
 */
function setupCourseListListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterCoursesBySearch(e.target.value);
        });
    }
    
    // Semester filters
    const fallFilter = document.getElementById('fallFilter');
    const springFilter = document.getElementById('springFilter');
    
    if (fallFilter) {
        fallFilter.addEventListener('change', (e) => {
            filterCoursesBySemester('fall', e.target.checked);
        });
    }
    
    if (springFilter) {
        springFilter.addEventListener('change', (e) => {
            filterCoursesBySemester('spring', e.target.checked);
        });
    }
}

// Export functions to global scope
window.renderCourseList = renderCourseList;
window.createCourseItem = createCourseItem;
window.highlightCourseInList = highlightCourseInList;
window.filterCoursesBySearch = filterCoursesBySearch;
window.filterCoursesBySemester = filterCoursesBySemester;
window.getFilteredCourses = getFilteredCourses;
window.setupCourseListListeners = setupCourseListListeners;
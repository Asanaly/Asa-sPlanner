// Course list rendering and filtering

/**
 * Render the course list in sidebar with smart sorting and grade level filtering
 */
function renderCourseList() {
    const courseList = document.getElementById('courseList');
    const state = getAppState();
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    // Get grade level filter states
    const showFreshman = document.getElementById('freshmanFilter')?.checked ?? true;
    const showSophomore = document.getElementById('sophomoreFilter')?.checked ?? true;
    const showJunior = document.getElementById('juniorFilter')?.checked ?? true;
    const showSenior = document.getElementById('seniorFilter')?.checked ?? true;
    const showGeneral = document.getElementById('generalFilter')?.checked ?? true;
    
    courseList.innerHTML = '';
    
    // Filter by search term and grade level
    const filteredCourses = state.allCourses.filter(course => {
        const matchesSearch = course.code.toLowerCase().includes(searchTerm) || 
                             course.name.toLowerCase().includes(searchTerm);
        
        const gradeLevel = course.grade_level || 'general';
        const matchesGradeLevel = (gradeLevel === 'freshman' && showFreshman) ||
                                 (gradeLevel === 'sophomore' && showSophomore) ||
                                 (gradeLevel === 'junior' && showJunior) ||
                                 (gradeLevel === 'senior' && showSenior) ||
                                 (gradeLevel === 'general' && showGeneral);
        
        return matchesSearch && matchesGradeLevel;
    });
    
    // Sort courses: available for current semester first, then by grade level, then alphabetical
    const currentSemester = state.currentSemester;
    const gradeOrder = { 'freshman': 1, 'sophomore': 2, 'junior': 3, 'senior': 4, 'general': 5 };
    
    const sortedCourses = filteredCourses.sort((a, b) => {
        const aAvailable = a.available_semesters.includes(currentSemester);
        const bAvailable = b.available_semesters.includes(currentSemester);
        
        // Available courses first
        if (aAvailable && !bAvailable) return -1;
        if (!aAvailable && bAvailable) return 1;
        
        // Then by grade level
        const aGrade = gradeOrder[a.grade_level || 'general'];
        const bGrade = gradeOrder[b.grade_level || 'general'];
        if (aGrade !== bGrade) return aGrade - bGrade;
        
        // Then alphabetical by course code
        return a.code.localeCompare(b.code);
    });
    
    sortedCourses.forEach(course => {
        const courseItem = createCourseItem(course);
        courseList.appendChild(courseItem);
    });
}

/**
 * Create a course item element with semester badges and grade level styling
 * @param {Object} course - Course data
 * @returns {HTMLElement} Course item element
 */
function createCourseItem(course) {
    const courseItem = document.createElement('div');
    const state = getAppState();
    const isAvailableThisSemester = course.available_semesters.includes(state.currentSemester);
    
    // Debug logging
    console.log(`Creating course item for ${course.code}:`);
    console.log(`- Current semester: ${state.currentSemester}`);
    console.log(`- Available semesters:`, course.available_semesters);
    console.log(`- Available this semester: ${isAvailableThisSemester}`);
    
    courseItem.className = 'course-item';
    courseItem.dataset.courseId = course.id;
    
    // Add grade level styling
    const gradeLevel = course.grade_level || 'general';
    courseItem.classList.add(`grade-${gradeLevel}`);
    
    // Check if course is already scheduled for THIS semester
    const isScheduled = isCourseScheduled(course.id);
    console.log(`- Is scheduled in ${state.currentSemester}: ${isScheduled}`);
    
    // Apply CSS classes based on state
    if (isScheduled) {
        console.log(`- Adding 'disabled' class to ${course.code}`);
        courseItem.classList.add('disabled');
    } else if (!isAvailableThisSemester) {
        console.log(`- Adding 'semester-unavailable' class to ${course.code}`);
        courseItem.classList.add('semester-unavailable');
    } else {
        console.log(`- ${course.code} is available and draggable`);
        courseItem.draggable = true;
    }
    
    // Create semester badges
    const semesterBadges = course.available_semesters.map(semester => {
        const badgeText = semester === 'fall' ? 'Fall' : 
                         semester === 'spring' ? 'Spr' : 'Sum';
        return `<span class="semester-badge semester-${semester}">${badgeText}</span>`;
    }).join('');
    
    // Create grade level indicator
    const gradeRomanMap = {
        'freshman': 'I',
        'sophomore': 'II', 
        'junior': 'III',
        'senior': 'IV',
        'general': 'G'
    };
    const gradeRoman = gradeRomanMap[gradeLevel] || 'G';
    
    courseItem.innerHTML = `
        <div class="course-header">
            <div class="course-code" onclick="showCourseDetails(${course.id})">${course.code}</div>
            <div class="course-indicators">
                <span class="grade-indicator">${gradeRoman}</span>
                <div class="semester-badges">${semesterBadges}</div>
            </div>
        </div>
        <div class="course-name">${course.name}</div>
        <div class="course-credits">${course.credits} credits</div>
        <div class="difficulty-indicator">
            ${'★'.repeat(course.difficulty_level)}${'☆'.repeat(5-course.difficulty_level)}
        </div>
        ${course.prerequisites && course.prerequisites.length > 0 ? 
            `<span class="prerequisites-link" onclick="showPrerequisites('${course.code}', event)">Prerequisites: ${course.prerequisites.join(', ')}</span>` 
            : ''}
    `;
    
    // Only add drag listeners if available and not scheduled
    if (!isScheduled && isAvailableThisSemester) {
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
            renderCourseList();
        });
    }
    
    // Grade level filters
    const gradeFilters = ['freshmanFilter', 'sophomoreFilter', 'juniorFilter', 'seniorFilter', 'generalFilter'];
    gradeFilters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', () => {
                renderCourseList();
            });
        }
    });
}

// Export functions to global scope
window.renderCourseList = renderCourseList;
window.createCourseItem = createCourseItem;
window.highlightCourseInList = highlightCourseInList;
window.filterCoursesBySearch = filterCoursesBySearch;
window.filterCoursesBySemester = filterCoursesBySemester;
window.getFilteredCourses = getFilteredCourses;
window.setupCourseListListeners = setupCourseListListeners;
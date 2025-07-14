// Schedule grid management and drag-drop functionality

/**
 * Initialize the schedule grid
 */
function initializeGrid() {
    const grid = document.getElementById('scheduleGrid');
    grid.innerHTML = '';
    
    // Empty corner cell
    grid.appendChild(createGridCell('', 'time-slot'));
    
    // Day headers
    window.CONFIG.DAYS.forEach(day => {
        grid.appendChild(createGridCell(day, 'day-header'));
    });
    
    // Time slots and schedule cells
    window.CONFIG.TIME_SLOTS.forEach(timeSlot => {
        // Time header
        grid.appendChild(createGridCell(timeSlot, 'time-header'));
        
        // Schedule slots for each day
        window.CONFIG.DAYS.forEach(day => {
            const cell = createGridCell('', 'schedule-slot');
            cell.dataset.day = day;
            cell.dataset.timeSlot = timeSlot;
            setupDropZone(cell);
            grid.appendChild(cell);
        });
    });
}

/**
 * Create a grid cell element
 * @param {string} content - Cell content
 * @param {string} className - Additional CSS class
 * @returns {HTMLElement} Grid cell element
 */
function createGridCell(content, className) {
    const cell = document.createElement('div');
    cell.className = `time-slot ${className}`;
    cell.innerHTML = content;
    return cell;
}

/**
 * Setup drop zone for schedule cells
 * @param {HTMLElement} cell - Schedule cell element
 */
function setupDropZone(cell) {
    cell.addEventListener('dragover', handleDragOver);
    cell.addEventListener('drop', handleDrop);
    cell.addEventListener('dragleave', handleDragLeave);
}

/**
 * Render scheduled courses on the grid
 */
function renderScheduledCourses() {
    // Clear existing scheduled courses
    document.querySelectorAll('.scheduled-course').forEach(el => el.remove());
    
    // Add courses for current semester
    const semesterCourses = getCurrentSemesterCourses();
    
    semesterCourses.forEach(scheduleItem => {
        const course = scheduleItem.course;
        
        course.time_slots.forEach(timeSlot => {
            const cells = findScheduleCells(timeSlot.day, timeSlot.start, timeSlot.end);
            if (cells.length > 0) {
                const courseElement = createScheduledCourseElement(course, timeSlot, cells);
                cells[0].appendChild(courseElement);
            }
        });
    });
}

/**
 * Create a scheduled course element
 * @param {Object} course - Course data
 * @param {Object} timeSlot - Time slot data
 * @param {Array} cells - Grid cells for this course
 * @returns {HTMLElement} Scheduled course element
 */
function createScheduledCourseElement(course, timeSlot, cells) {
    const courseElement = document.createElement('div');
    courseElement.className = 'scheduled-course';
    courseElement.style.background = getCourseColor(course.code);
    
    // Calculate exact positioning within the cell
    const firstCell = cells[0];
    const cellTimeSlot = firstCell.dataset.timeSlot;
    const [cellStart] = cellTimeSlot.split('-');
    
    const courseStartMin = timeToMinutes(timeSlot.start);
    const courseEndMin = timeToMinutes(timeSlot.end);
    const cellStartMin = timeToMinutes(cellStart);
    
    // Calculate offset from cell start (in pixels)
    const minutesPerPixel = 60 / 60; // 60px per hour
    const topOffset = Math.max(0, (courseStartMin - cellStartMin) * minutesPerPixel);
    
    // Calculate height based on course duration
    const courseDurationMin = courseEndMin - courseStartMin;
    const height = Math.min(courseDurationMin * minutesPerPixel, cells.length * 60 - topOffset);
    
    courseElement.style.height = `${height - 4}px`;
    courseElement.style.top = `${topOffset}px`;
    
    courseElement.innerHTML = `
        <div onclick="showCourseDetails(${course.id})" style="cursor: pointer;">
            <strong>${course.code}</strong><br>
            <small>${timeSlot.start}-${timeSlot.end}</small>
        </div>
        <button class="remove-course" onclick="removeCourseFromSchedule(${course.id})">×</button>
    `;
    
    return courseElement;
}

/**
 * Find schedule cells for given day and time (can span multiple cells)
 * @param {string} day - Day of week
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 * @returns {Array} Array of matching cells
 */
function findScheduleCells(day, startTime, endTime) {
    const cells = document.querySelectorAll('.schedule-slot');
    const matchingCells = [];
    const courseStart = timeToMinutes(startTime);
    const courseEnd = timeToMinutes(endTime);
    
    for (let cell of cells) {
        if (cell.dataset.day === day) {
            const cellTimeSlot = cell.dataset.timeSlot;
            const [cellStart, cellEnd] = cellTimeSlot.split('-');
            const cellStartMin = timeToMinutes(cellStart);
            const cellEndMin = timeToMinutes(cellEnd);
            
            // Include cell if any part of course time overlaps with cell time
            if (!(courseEnd <= cellStartMin || courseStart >= cellEndMin)) {
                matchingCells.push(cell);
            }
        }
    }
    
    return matchingCells.sort((a, b) => {
        const timeA = a.dataset.timeSlot.split('-')[0];
        const timeB = b.dataset.timeSlot.split('-')[0];
        return timeToMinutes(timeA) - timeToMinutes(timeB);
    });
}

/**
 * Handle drag start event
 * @param {Event} e - Drag event
 */
function handleDragStart(e) {
    console.log('Drag started for:', e.target.dataset.courseId);
    if (e.target.classList.contains('disabled')) {
        e.preventDefault();
        return;
    }
    updateAppState({ draggedElement: e.target });
    e.dataTransfer.effectAllowed = 'move';
}

/**
 * Handle drag over event
 * @param {Event} e - Drag event
 */
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.target.classList.add('drag-over');
}

/**
 * Handle drag leave event
 * @param {Event} e - Drag event
 */
function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

/**
 * Handle drop event
 * @param {Event} e - Drop event
 */
async function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    
    const state = getAppState();
    if (!state.draggedElement) return;
    
    const courseId = parseInt(state.draggedElement.dataset.courseId);
    const course = state.allCourses.find(c => c.id === courseId);
    
    if (!course) return;
    
    // Check if course is available for current semester
    if (!course.available_semesters.includes(state.currentSemester)) {
        alert(`Course ${course.code} is not available in ${state.currentSemester} semester`);
        return;
    }
    
    // Add to schedule
    await addCourseToSchedule(course);
    updateAppState({ draggedElement: null });
}

function setupSemesterTabs() {
    const tabsContainer = document.getElementById('semesterTabs');
    const semesters = getCurrentAcademicSemesters();
    
    tabsContainer.innerHTML = `
        <button class="semester-tab active" data-semester="fall">${semesters.fall}</button>
        <button class="semester-tab" data-semester="spring">${semesters.spring}</button>
        <button class="semester-tab" data-semester="summer">${semesters.summer}</button>
    `;
    
    // Add click listeners to new tabs
    document.querySelectorAll('.semester-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            console.log('🎯 Tab clicked:', e.target, 'Dataset:', e.target.dataset);
            
            // Ensure we get the button element, not child text node
            const button = e.target.closest('button.semester-tab');
            if (!button) {
                console.error('❌ Could not find semester tab button');
                return;
            }
            
            const semester = button.dataset.semester;
            console.log('🎯 Switching to semester:', semester);
            
            // Remove active class from all tabs
            document.querySelectorAll('.semester-tab').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            button.classList.add('active');
            
            // Update current semester in state
            updateAppState({ currentSemester: semester });
            
            // Re-render course list and schedule
            renderCourseList();
            renderScheduledCourses();
        });
    });
}

// Export functions to global scope
window.initializeGrid = initializeGrid;
window.createGridCell = createGridCell;
window.setupDropZone = setupDropZone;
window.renderScheduledCourses = renderScheduledCourses;
window.createScheduledCourseElement = createScheduledCourseElement;
window.findScheduleCells = findScheduleCells;
window.handleDragStart = handleDragStart;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;
window.setupSemesterTabs = setupSemesterTabs;
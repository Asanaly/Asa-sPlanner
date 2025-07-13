/**
 * Frontend JavaScript Tests for Course Planner
 * 
 * These tests can be run in the browser console or with a testing framework like Jest
 * For browser testing: Load the page and run runAllTests() in console
 */

// Test utility functions
const TestUtils = {
    // Mock fetch for testing API calls
    mockFetch: (response, status = 200) => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: status >= 200 && status < 300,
                status: status,
                json: () => Promise.resolve(response),
            })
        );
    },
    
    // Create mock course data
    createMockCourse: (overrides = {}) => ({
        id: 1,
        code: 'VE281',
        name: 'Data Structures and Algorithms',
        credits: 4,
        description: 'Test description',
        time_slots: [
            { day: 'Mon', start: '09:30', end: '11:00' },
            { day: 'Wed', start: '09:30', end: '11:00' }
        ],
        available_semesters: ['fall', 'spring'],
        difficulty_level: 4,
        workload_hours: 12,
        prerequisites: ['VE280'],
        ...overrides
    }),
    
    // Create DOM elements for testing
    createMockDOM: () => {
        // Create basic DOM structure
        document.body.innerHTML = `
            <div id="courseList"></div>
            <div id="scheduleGrid"></div>
            <div id="conflictWarnings"></div>
            <div id="totalCredits">0</div>
            <div id="totalCourses">0</div>
            <div id="avgDifficulty">0</div>
            <div id="totalWorkload">0</div>
            <input id="searchInput" type="text" />
            <input id="fallFilter" type="checkbox" checked />
            <input id="springFilter" type="checkbox" checked />
            <div id="courseModal" class="modal">
                <div class="modal-content">
                    <h2 id="modalCourseTitle"></h2>
                    <div id="modalCourseContent"></div>
                </div>
            </div>
        `;
    },
    
    // Assert function for testing
    assert: (condition, message) => {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
        console.log(`✓ ${message}`);
    },
    
    // Test runner
    runTest: async (testName, testFunction) => {
        try {
            console.log(`\n🧪 Running test: ${testName}`);
            await testFunction();
            console.log(`✅ Test passed: ${testName}`);
            return true;
        } catch (error) {
            console.error(`❌ Test failed: ${testName}`, error);
            return false;
        }
    }
};

// Time utility function tests
const TimeUtilityTests = {
    testTimeToMinutes: () => {
        TestUtils.assert(timeToMinutes('09:30') === 570, 'timeToMinutes converts 09:30 correctly');
        TestUtils.assert(timeToMinutes('12:00') === 720, 'timeToMinutes converts 12:00 correctly');
        TestUtils.assert(timeToMinutes('23:45') === 1425, 'timeToMinutes converts 23:45 correctly');
    },
    
    testTimeOverlaps: () => {
        // Test overlapping times
        TestUtils.assert(
            timeOverlapsOrContained('09:30', '11:00', '10:00', '11:00'),
            'Detects overlap: 09:30-11:00 overlaps with 10:00-11:00'
        );
        
        // Test non-overlapping times
        TestUtils.assert(
            !timeOverlapsOrContained('09:30', '11:00', '11:00', '12:00'),
            'Detects no overlap: 09:30-11:00 does not overlap with 11:00-12:00'
        );
        
        // Test complete containment
        TestUtils.assert(
            timeOverlapsOrContained('09:00', '12:00', '10:00', '11:00'),
            'Detects containment: 09:00-12:00 contains 10:00-11:00'
        );
    }
};

// Course rendering tests
const CourseRenderingTests = {
    testRenderCourseList: () => {
        TestUtils.createMockDOM();
        
        // Mock global variables
        window.allCourses = [
            TestUtils.createMockCourse({ code: 'VE281', name: 'Data Structures' }),
            TestUtils.createMockCourse({ code: 'VE280', name: 'Programming', prerequisites: [] })
        ];
        window.currentSchedule = [];
        
        renderCourseList();
        
        const courseList = document.getElementById('courseList');
        const courseItems = courseList.querySelectorAll('.course-item');
        
        TestUtils.assert(courseItems.length === 2, 'Renders correct number of courses');
        TestUtils.assert(courseItems[0].querySelector('.course-code').textContent === 'VE281', 'Renders course code correctly');
        TestUtils.assert(courseItems[0].querySelector('.course-name').textContent === 'Data Structures', 'Renders course name correctly');
    },
    
    testCourseFiltering: () => {
        TestUtils.createMockDOM();
        
        window.allCourses = [
            TestUtils.createMockCourse({ code: 'VE281', available_semesters: ['fall'] }),
            TestUtils.createMockCourse({ code: 'VE280', available_semesters: ['spring'] })
        ];
        window.currentSchedule = [];
        
        // Test fall filter only
        document.getElementById('fallFilter').checked = true;
        document.getElementById('springFilter').checked = false;
        renderCourseList();
        
        const courseItems = document.querySelectorAll('.course-item');
        TestUtils.assert(courseItems.length === 1, 'Fall filter shows only fall courses');
        TestUtils.assert(courseItems[0].querySelector('.course-code').textContent === 'VE281', 'Shows correct fall course');
    },
    
    testCourseSearch: () => {
        TestUtils.createMockDOM();
        
        window.allCourses = [
            TestUtils.createMockCourse({ code: 'VE281', name: 'Data Structures' }),
            TestUtils.createMockCourse({ code: 'VE280', name: 'Programming' })
        ];
        window.currentSchedule = [];
        
        // Test search functionality
        document.getElementById('searchInput').value = 'data';
        renderCourseList();
        
        const courseItems = document.querySelectorAll('.course-item');
        TestUtils.assert(courseItems.length === 1, 'Search filters courses correctly');
        TestUtils.assert(courseItems[0].querySelector('.course-code').textContent === 'VE281', 'Shows correct search result');
    }
};

// Schedule management tests
const ScheduleManagementTests = {
    testAddCourseToSchedule: async () => {
        TestUtils.createMockDOM();
        TestUtils.mockFetch({ conflicts: [] });
        
        window.allCourses = [TestUtils.createMockCourse()];
        window.currentSchedule = [];
        window.currentSemester = 'fall';
        window.courseColorMap = new Map();
        
        const course = TestUtils.createMockCourse();
        await addCourseToSchedule(course);
        
        TestUtils.assert(currentSchedule.length === 1, 'Course added to schedule');
        TestUtils.assert(currentSchedule[0].course.code === 'VE281', 'Correct course added');
        TestUtils.assert(currentSchedule[0].semester === 'fall', 'Correct semester set');
    },
    
    testRemoveCourseFromSchedule: () => {
        TestUtils.createMockDOM();
        
        const course = TestUtils.createMockCourse();
        window.currentSchedule = [{
            course: course,
            semester: 'fall',
            year: 2025
        }];
        window.currentSemester = 'fall';
        window.courseColorMap = new Map();
        
        removeCourseFromSchedule(course.id);
        
        TestUtils.assert(currentSchedule.length === 0, 'Course removed from schedule');
    },
    
    testScheduleStatistics: () => {
        TestUtils.createMockDOM();
        
        window.currentSchedule = [
            {
                course: TestUtils.createMockCourse({ credits: 4, difficulty_level: 4, workload_hours: 12 }),
                semester: 'fall'
            },
            {
                course: TestUtils.createMockCourse({ code: 'VE280', credits: 3, difficulty_level: 3, workload_hours: 10 }),
                semester: 'fall'
            }
        ];
        window.currentSemester = 'fall';
        
        updateStats();
        
        TestUtils.assert(document.getElementById('totalCredits').textContent === '7', 'Total credits calculated correctly');
        TestUtils.assert(document.getElementById('totalCourses').textContent === '2', 'Total courses calculated correctly');
        TestUtils.assert(document.getElementById('avgDifficulty').textContent === '3.5', 'Average difficulty calculated correctly');
        TestUtils.assert(document.getElementById('totalWorkload').textContent === '22', 'Total workload calculated correctly');
    }
};

// Grid and positioning tests
const GridPositioningTests = {
    testFindScheduleCells: () => {
        TestUtils.createMockDOM();
        
        // Create mock grid cells
        const scheduleGrid = document.getElementById('scheduleGrid');
        scheduleGrid.innerHTML = `
            <div class="schedule-slot" data-day="Mon" data-time-slot="09:00-10:00"></div>
            <div class="schedule-slot" data-day="Mon" data-time-slot="10:00-11:00"></div>
            <div class="schedule-slot" data-day="Mon" data-time-slot="11:00-12:00"></div>
        `;
        
        // Test finding cells for course that spans 09:30-11:00
        const cells = findScheduleCells('Mon', '09:30', '11:00');
        
        TestUtils.assert(cells.length === 2, 'Finds correct number of overlapping cells');
        TestUtils.assert(cells[0].dataset.timeSlot === '09:00-10:00', 'Finds first overlapping cell');
        TestUtils.assert(cells[1].dataset.timeSlot === '10:00-11:00', 'Finds second overlapping cell');
    },
    
    testInitializeGrid: () => {
        TestUtils.createMockDOM();
        
        // Mock timeSlots and days
        window.timeSlots = ['08:00-09:00', '09:00-10:00'];
        window.days = ['Mon', 'Tue'];
        
        initializeGrid();
        
        const grid = document.getElementById('scheduleGrid');
        const slots = grid.querySelectorAll('.schedule-slot');
        
        // Should have header cells + time cells + schedule cells
        // (1 corner + 2 days + 2 times + 4 schedule cells = 9 total)
        TestUtils.assert(slots.length === 9, 'Grid initialized with correct number of cells');
        
        const scheduleSlots = grid.querySelectorAll('.schedule-slot[data-day]');
        TestUtils.assert(scheduleSlots.length === 4, 'Correct number of schedule slots created');
    }
};

// Modal and UI tests
const ModalUITests = {
    testShowCourseDetails: async () => {
        TestUtils.createMockDOM();
        TestUtils.mockFetch(TestUtils.createMockCourse());
        
        await showCourseDetails(1);
        
        const modal = document.getElementById('courseModal');
        const title = document.getElementById('modalCourseTitle');
        const content = document.getElementById('modalCourseContent');
        
        TestUtils.assert(modal.classList.contains('show'), 'Modal is shown');
        TestUtils.assert(title.textContent.includes('VE281'), 'Modal title is correct');
        TestUtils.assert(content.innerHTML.includes('Description'), 'Modal content includes description section');
        TestUtils.assert(content.innerHTML.includes('Schedule'), 'Modal content includes schedule section');
    },
    
    testCloseModal: () => {
        TestUtils.createMockDOM();
        
        const modal = document.getElementById('courseModal');
        modal.classList.add('show');
        
        closeModal();
        
        TestUtils.assert(!modal.classList.contains('show'), 'Modal is hidden after close');
    },
    
    testHighlightCourseInList: () => {
        TestUtils.createMockDOM();
        
        // Create mock course items
        const courseList = document.getElementById('courseList');
        courseList.innerHTML = `
            <div class="course-item">
                <div class="course-code">VE281</div>
            </div>
            <div class="course-item">
                <div class="course-code">VE280</div>
            </div>
        `;
        
        highlightCourseInList('VE281');
        
        const highlightedItem = courseList.querySelector('.course-item.highlight-found');
        TestUtils.assert(highlightedItem !== null, 'Course item is highlighted');
        TestUtils.assert(
            highlightedItem.querySelector('.course-code').textContent === 'VE281',
            'Correct course is highlighted'
        );
    }
};

// Prerequisites functionality tests
const PrerequisitesTests = {
    testGetAllPrerequisites: () => {
        window.allCourses = [
            TestUtils.createMockCourse({ code: 'VE482', prerequisites: ['VE281', 'VE370'] }),
            TestUtils.createMockCourse({ code: 'VE281', prerequisites: ['VE280'] }),
            TestUtils.createMockCourse({ code: 'VE370', prerequisites: ['VE280'] }),
            TestUtils.createMockCourse({ code: 'VE280', prerequisites: [] })
        ];
        
        const allPrereqs = getAllPrerequisites('VE482');
        
        TestUtils.assert(allPrereqs.has('VE281'), 'Includes direct prerequisite VE281');
        TestUtils.assert(allPrereqs.has('VE370'), 'Includes direct prerequisite VE370');
        TestUtils.assert(allPrereqs.has('VE280'), 'Includes nested prerequisite VE280');
        TestUtils.assert(allPrereqs.size === 3, 'Returns correct number of prerequisites');
    },
    
    testCircularPrerequisites: () => {
        // Test circular prerequisite detection
        window.allCourses = [
            TestUtils.createMockCourse({ code: 'VE281', prerequisites: ['VE280'] }),
            TestUtils.createMockCourse({ code: 'VE280', prerequisites: ['VE281'] }) // Circular dependency
        ];
        
        const allPrereqs = getAllPrerequisites('VE281');
        
        TestUtils.assert(allPrereqs.size === 1, 'Handles circular dependencies without infinite loop');
        TestUtils.assert(allPrereqs.has('VE280'), 'Returns valid prerequisites despite circular dependency');
    }
};

// Conflict detection tests
const ConflictDetectionTests = {
    testCheckScheduleConflicts: async () => {
        TestUtils.mockFetch({
            conflicts: [
                {
                    course1: 'VE281',
                    course2: 'VE270',
                    day: 'Mon',
                    time1: '09:30-11:00',
                    time2: '10:30-12:00'
                }
            ]
        });
        
        const conflicts = await checkScheduleConflicts([1, 2]);
        
        TestUtils.assert(conflicts.length === 1, 'Returns conflict data');
        TestUtils.assert(conflicts[0].course1 === 'VE281', 'Conflict data includes correct course1');
        TestUtils.assert(conflicts[0].course2 === 'VE270', 'Conflict data includes correct course2');
        TestUtils.assert(conflicts[0].day === 'Mon', 'Conflict data includes correct day');
    },
    
    testShowConflictWarnings: async () => {
        TestUtils.createMockDOM();
        TestUtils.mockFetch({
            conflicts: [
                { course1: 'VE281', course2: 'VE270', day: 'Mon' }
            ]
        });
        
        window.currentSchedule = [
            { course: { id: 1 }, semester: 'fall' },
            { course: { id: 2 }, semester: 'fall' }
        ];
        window.currentSemester = 'fall';
        
        await showConflictWarnings();
        
        const warningsDiv = document.getElementById('conflictWarnings');
        TestUtils.assert(warningsDiv.innerHTML.includes('VE281'), 'Shows conflict warning with course names');
        TestUtils.assert(warningsDiv.innerHTML.includes('conflicts with'), 'Shows conflict message');
    }
};

// Drag and drop tests
const DragDropTests = {
    testHandleDragStart: () => {
        TestUtils.createMockDOM();
        
        const courseItem = document.createElement('div');
        courseItem.className = 'course-item';
        courseItem.dataset.courseId = '1';
        
        const mockEvent = {
            target: courseItem,
            dataTransfer: {
                effectAllowed: null,
                setData: jest.fn()
            }
        };
        
        handleDragStart(mockEvent);
        
        TestUtils.assert(window.draggedElement === courseItem, 'Sets dragged element correctly');
        TestUtils.assert(mockEvent.dataTransfer.effectAllowed === 'move', 'Sets correct drag effect');
    },
    
    testHandleDragStartDisabled: () => {
        TestUtils.createMockDOM();
        
        const courseItem = document.createElement('div');
        courseItem.className = 'course-item disabled';
        
        const mockEvent = {
            target: courseItem,
            preventDefault: jest.fn(),
            dataTransfer: { effectAllowed: null }
        };
        
        handleDragStart(mockEvent);
        
        TestUtils.assert(mockEvent.preventDefault.called, 'Prevents drag for disabled items');
    },
    
    testHandleDragOver: () => {
        const mockEvent = {
            preventDefault: jest.fn(),
            target: document.createElement('div'),
            dataTransfer: { dropEffect: null }
        };
        
        handleDragOver(mockEvent);
        
        TestUtils.assert(mockEvent.preventDefault.called, 'Prevents default drag over behavior');
        TestUtils.assert(mockEvent.dataTransfer.dropEffect === 'move', 'Sets correct drop effect');
        TestUtils.assert(mockEvent.target.classList.contains('drag-over'), 'Adds drag-over class');
    }
};

// Color assignment tests
const ColorTests = {
    testCourseColorAssignment: () => {
        TestUtils.createMockDOM();
        
        window.courseColorMap = new Map();
        window.courseColors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        ];
        window.currentSchedule = [
            {
                course: TestUtils.createMockCourse({ code: 'VE281' }),
                semester: 'fall'
            },
            {
                course: TestUtils.createMockCourse({ code: 'VE280' }),
                semester: 'fall'
            }
        ];
        window.currentSemester = 'fall';
        
        // Mock findScheduleCells to return mock cells
        window.findScheduleCells = () => [document.createElement('div')];
        
        renderScheduledCourses();
        
        TestUtils.assert(courseColorMap.has('VE281'), 'Assigns color to first course');
        TestUtils.assert(courseColorMap.has('VE280'), 'Assigns color to second course');
        TestUtils.assert(courseColorMap.get('VE281') !== courseColorMap.get('VE280'), 'Assigns different colors to different courses');
    }
};

// API integration tests
const APIIntegrationTests = {
    testLoadCourses: async () => {
        TestUtils.createMockDOM();
        TestUtils.mockFetch({
            courses: [
                TestUtils.createMockCourse({ code: 'VE281' }),
                TestUtils.createMockCourse({ code: 'VE280' })
            ]
        });
        
        await loadCourses();
        
        TestUtils.assert(window.allCourses.length === 2, 'Loads courses from API');
        TestUtils.assert(window.allCourses[0].code === 'VE281', 'Loads correct course data');
    },
    
    testAPIErrorHandling: async () => {
        TestUtils.createMockDOM();
        TestUtils.mockFetch({}, 500);
        
        // Mock console.error to capture error
        const originalError = console.error;
        let errorCaught = false;
        console.error = () => { errorCaught = true; };
        
        await loadCourses();
        
        console.error = originalError;
        TestUtils.assert(errorCaught, 'Handles API errors gracefully');
    }
};

// Performance tests
const PerformanceTests = {
    testRenderPerformance: () => {
        TestUtils.createMockDOM();
        
        // Create large dataset
        const largeCourseList = Array.from({ length: 100 }, (_, i) => 
            TestUtils.createMockCourse({ 
                code: `VE${200 + i}`, 
                name: `Course ${i}` 
            })
        );
        
        window.allCourses = largeCourseList;
        window.currentSchedule = [];
        
        const startTime = performance.now();
        renderCourseList();
        const endTime = performance.now();
        
        const renderTime = endTime - startTime;
        TestUtils.assert(renderTime < 100, `Renders 100 courses in reasonable time (${renderTime.toFixed(2)}ms)`);
    },
    
    testSearchPerformance: () => {
        TestUtils.createMockDOM();
        
        // Create large dataset
        const largeCourseList = Array.from({ length: 1000 }, (_, i) => 
            TestUtils.createMockCourse({ 
                code: `VE${200 + i}`, 
                name: `Course ${i}` 
            })
        );
        
        window.allCourses = largeCourseList;
        window.currentSchedule = [];
        
        document.getElementById('searchInput').value = 'VE205';
        
        const startTime = performance.now();
        renderCourseList();
        const endTime = performance.now();
        
        const searchTime = endTime - startTime;
        TestUtils.assert(searchTime < 50, `Searches through 1000 courses quickly (${searchTime.toFixed(2)}ms)`);
        
        const courseItems = document.querySelectorAll('.course-item');
        TestUtils.assert(courseItems.length === 1, 'Search returns correct results');
    }
};

// Integration tests
const IntegrationTests = {
    testCompleteWorkflow: async () => {
        TestUtils.createMockDOM();
        TestUtils.mockFetch({ conflicts: [] });
        
        // Initialize application state
        window.allCourses = [TestUtils.createMockCourse()];
        window.currentSchedule = [];
        window.currentSemester = 'fall';
        window.courseColorMap = new Map();
        window.timeSlots = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00'];
        window.days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        
        // Test complete workflow: initialize -> render -> add course -> check stats
        initializeGrid();
        renderCourseList();
        
        const course = TestUtils.createMockCourse();
        await addCourseToSchedule(course);
        updateStats();
        
        // Verify final state
        TestUtils.assert(currentSchedule.length === 1, 'Course added to schedule');
        TestUtils.assert(document.getElementById('totalCredits').textContent === '4', 'Stats updated correctly');
        TestUtils.assert(document.getElementById('totalCourses').textContent === '1', 'Course count updated');
        
        // Test removal
        removeCourseFromSchedule(course.id);
        updateStats();
        
        TestUtils.assert(currentSchedule.length === 0, 'Course removed from schedule');
        TestUtils.assert(document.getElementById('totalCredits').textContent === '0', 'Stats reset after removal');
    }
};

// Test runner function
async function runAllTests() {
    console.log('🚀 Starting Course Planner Frontend Tests...\n');
    
    const testSuites = [
        { name: 'Time Utility Tests', tests: TimeUtilityTests },
        { name: 'Course Rendering Tests', tests: CourseRenderingTests },
        { name: 'Schedule Management Tests', tests: ScheduleManagementTests },
        { name: 'Grid Positioning Tests', tests: GridPositioningTests },
        { name: 'Modal UI Tests', tests: ModalUITests },
        { name: 'Prerequisites Tests', tests: PrerequisitesTests },
        { name: 'Conflict Detection Tests', tests: ConflictDetectionTests },
        { name: 'Drag Drop Tests', tests: DragDropTests },
        { name: 'Color Tests', tests: ColorTests },
        { name: 'API Integration Tests', tests: APIIntegrationTests },
        { name: 'Performance Tests', tests: PerformanceTests },
        { name: 'Integration Tests', tests: IntegrationTests }
    ];
    
    let totalTests = 0;
    let passedTests = 0;
    
    for (const suite of testSuites) {
        console.log(`\n📋 ${suite.name}`);
        console.log('='.repeat(suite.name.length + 4));
        
        for (const [testName, testFunction] of Object.entries(suite.tests)) {
            totalTests++;
            const passed = await TestUtils.runTest(testName, testFunction);
            if (passed) passedTests++;
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed!');
    } else {
        console.log(`❌ ${totalTests - passedTests} tests failed`);
    }
    
    return { total: totalTests, passed: passedTests };
}

// Export for use in browser console or test runners
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        TestUtils,
        TimeUtilityTests,
        CourseRenderingTests,
        ScheduleManagementTests,
        GridPositioningTests,
        ModalUITests,
        PrerequisitesTests,
        ConflictDetectionTests,
        DragDropTests,
        ColorTests,
        APIIntegrationTests,
        PerformanceTests,
        IntegrationTests
    };
} else {
    // Browser environment
    window.CourseplannerTests = {
        runAllTests,
        TestUtils
    };
}
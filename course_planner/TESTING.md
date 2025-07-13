# Course Planner Test Summary

## Backend Tests (Django)

### How to Run
```bash
python manage.py test scheduler.tests
```

### Test Classes and What They Check

#### CourseModelTest
- **test_course_creation** - Creates course with all fields, verifies data saved correctly
- **test_course_string_representation** - Tests `__str__` method returns "CODE - Name" format
- **test_course_prerequisites** - Tests many-to-many prerequisite relationships work

#### UserScheduleModelTest  
- **test_user_schedule_creation** - Creates schedule entry, verifies user/course/semester assignment
- **test_user_schedule_unique_constraint** - Ensures duplicate schedule entries are prevented

#### CourseAPITest
- **test_api_courses_list** - GET /api/courses/ returns all courses with correct JSON structure
- **test_api_course_detail** - GET /api/courses/{id}/ returns single course details
- **test_api_course_detail_not_found** - Invalid course ID returns 404 error

#### ConflictDetectionTest
- **test_conflict_detection_with_overlap** - Detects time conflicts between overlapping courses
- **test_conflict_detection_no_overlap** - No conflicts detected for non-overlapping courses  
- **test_conflict_detection_single_course** - Single course returns no conflicts

#### UserScheduleAPITest
- **test_add_course_to_schedule** - POST /api/schedule/add/ adds course to user schedule
- **test_add_duplicate_course_to_schedule** - Prevents adding same course twice
- **test_get_user_schedule** - GET /api/schedule/ returns user's current schedule
- **test_remove_course_from_schedule** - DELETE removes course from schedule

#### ManagementCommandTest
- **test_populate_courses_command** - populate_courses command creates sample courses and prerequisites

#### ViewTest
- **test_index_view** - Main page loads correctly with proper HTML content

#### AuthenticationTest
- **test_unauthenticated_schedule_access** - Unauthenticated users redirected to login
- **test_authenticated_schedule_access** - Authenticated users can access schedule APIs

---

## Frontend Tests (JavaScript)

### How to Run
1. Start server: `python manage.py runserver`
2. Open http://localhost:8000
3. Open browser console (F12)
4. Run: `CourseplannerTests.runAllTests()`

### Test Suites and What They Check

#### TimeUtilityTests
- **testTimeToMinutes** - Converts time strings (09:30) to minutes (570)
- **testTimeOverlaps** - Detects overlapping and non-overlapping time ranges

#### CourseRenderingTests
- **testRenderCourseList** - Renders correct number of courses with proper HTML
- **testCourseFiltering** - Semester filters show only relevant courses
- **testCourseSearch** - Search input filters courses by name/code

#### ScheduleManagementTests
- **testAddCourseToSchedule** - Adds courses to schedule array and updates UI
- **testRemoveCourseFromSchedule** - Removes courses from schedule
- **testScheduleStatistics** - Calculates total credits, courses, difficulty, workload

#### GridPositioningTests
- **testFindScheduleCells** - Finds correct grid cells for course time slots
- **testInitializeGrid** - Creates schedule grid with proper headers and cells

#### ModalUITests
- **testShowCourseDetails** - Opens course detail modal with correct information
- **testCloseModal** - Closes modal and removes show class
- **testHighlightCourseInList** - Highlights courses in sidebar when clicked

#### PrerequisitesTests
- **testGetAllPrerequisites** - Recursively finds all course prerequisites
- **testCircularPrerequisites** - Handles circular dependencies without infinite loops

#### ConflictDetectionTests
- **testCheckScheduleConflicts** - API call returns conflict information
- **testShowConflictWarnings** - Displays conflict warnings in UI

#### DragDropTests
- **testHandleDragStart** - Sets dragged element and drag effects
- **testHandleDragStartDisabled** - Prevents dragging disabled courses
- **testHandleDragOver** - Sets proper drop effects and visual feedback

#### ColorTests
- **testCourseColorAssignment** - Assigns unique colors to different courses

#### APIIntegrationTests
- **testLoadCourses** - Fetches courses from API and populates arrays
- **testAPIErrorHandling** - Gracefully handles API errors

#### PerformanceTests
- **testRenderPerformance** - Renders 100 courses within time limit
- **testSearchPerformance** - Searches through 1000 courses quickly

#### IntegrationTests
- **testCompleteWorkflow** - Full workflow: load → render → add course → update stats → remove

---

## Quick Testing Commands

### Backend Only
```bash
python manage.py test scheduler.tests
```

### Frontend Only
1. `python manage.py runserver`
2. Open http://localhost:8000
3. Console: `CourseplannerTests.runAllTests()`

### Specific Test Classes
```bash
# Backend specific classes
python manage.py test scheduler.tests.CourseModelTest
python manage.py test scheduler.tests.ConflictDetectionTest

# Frontend specific suites (in browser console)
CourseplannerTests.TimeUtilityTests.testTimeToMinutes()
CourseplannerTests.ScheduleManagementTests.testAddCourseToSchedule()
```

### Expected Results
- **Backend:** All 19 tests should pass
- **Frontend:** All 30+ tests should pass with ✅ green checkmarks
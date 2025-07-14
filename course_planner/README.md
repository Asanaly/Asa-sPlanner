# JI Course Planner - Project Structure

## Overview
Academic planning platform for JI students with interactive scheduling and collaborative course information system.

## Project Structure

```
course_planner/
├── course_planner/                    # Django project configuration
│   ├── __init__.py
│   ├── settings.py                    # Django settings
│   ├── urls.py                        # Main URL configuration
│   ├── wsgi.py                        # WSGI configuration
│   └── asgi.py                        # ASGI configuration
├── scheduler/                         # Main Django app
│   ├── __init__.py
│   ├── models.py                      # Course and UserSchedule models
│   ├── views.py                       # API views and main page
│   ├── urls.py                        # App URL configuration
│   ├── admin.py                       # Django admin configuration
│   ├── apps.py                        # App configuration
│   ├── tests.py                       # Backend tests (19 test cases)
│   ├── templates/
│   │   └── scheduler/
│   │       └── index.html             # Main page template (minimal)
│   ├── management/
│   │   └── commands/
│   │       └── populate_courses.py   # Sample data population
│   └── migrations/                    # Database migrations
├── static/                            # Static files (organized)
│   ├── css/                          # Stylesheets
│   │   ├── main.css                  # Base styles & layout
│   │   ├── components.css            # UI components (course items, stats)
│   │   ├── schedule.css              # Schedule grid styles
│   │   ├── modal.css                 # Modal and popup styles
│   │   └── responsive.css            # Mobile responsive styles
│   └── js/                           # JavaScript modules
│       ├── config.js                 # App configuration & constants
│       ├── main.js                   # App initialization & setup
│       ├── tests.js                  # Frontend tests (26 test cases)
│       ├── api/
│       │   └── api.js                # API communication functions
│       ├── components/
│       │   ├── courseList.js         # Course rendering & filtering
│       │   ├── scheduleGrid.js       # Grid management & drag-drop
│       │   ├── scheduleManager.js    # Schedule CRUD operations
│       │   └── modal.js              # Course details & prerequisites
│       ├── state/
│       │   └── appState.js           # Global state management
│       └── utils/
│           ├── timeUtils.js          # Time calculations & validation
│           └── colorUtils.js         # Course color management
├── manage.py                         # Django management script
├── db.sqlite3                        # SQLite database
├── README.md                         # Project documentation
├── TESTING.md                        # Testing documentation
└── requirements.txt                  # Python dependencies
```

## Key Features

### ✅ Implemented (V2)
- **Interactive Schedule Grid**: Drag-and-drop course scheduling with conflict detection
- **Course Management**: Search, filter, and organize courses by semester
- **Prerequisites System**: Recursive prerequisite tracking with visual navigation
- **Course Details**: Modal popups with comprehensive course information
- **Statistics Dashboard**: Real-time credit, difficulty, and workload calculations
- **Responsive Design**: Mobile-friendly interface with touch support
- **Color-coded Courses**: Automatic color assignment for visual organization
- **Time Conflict Detection**: Smart overlap detection with user warnings

### 🔄 Planned (V3)
- **Summer Semester**: Three-semester planning support
- **Course Categories**: General electives, tech electives, humanities classification
- **Grade Levels**: Freshman/Sophomore/Junior/Senior course filtering
- **Persistent Storage**: Save schedules across browser sessions
- **Enhanced Conflicts**: Visual overlapping with transparency effects
- **Professor Integration**: Instructor information and ratings
- **Data Import**: Spreadsheet-based course data management

## Technology Stack

### Backend (Django)
- **Models**: Course, UserSchedule with JSONField support
- **APIs**: RESTful endpoints for courses, schedules, conflicts
- **Database**: SQLite (production-ready for PostgreSQL)
- **Authentication**: Django built-in user system

### Frontend (Modular Vanilla JS)
- **Architecture**: Component-based with clear separation of concerns
- **State Management**: Centralized app state with update functions
- **API Layer**: Abstracted fetch functions with error handling
- **UI Components**: Reusable modal, grid, and list components
- **Utilities**: Time calculations, color management, validation

## Code Organization Benefits

### 🎯 **Maintainability**
- **Separation of Concerns**: CSS, JS, and HTML in logical files
- **Single Responsibility**: Each module has a clear, focused purpose
- **Consistent Patterns**: Standardized function exports and naming

### 🚀 **Scalability**
- **Modular Architecture**: Easy to add new features without touching existing code
- **Component Reusability**: Modal, grid, and list components can be extended
- **State Management**: Centralized state makes data flow predictable

### 🔧 **Developer Experience**
- **Easy Debugging**: Clear module boundaries help isolate issues
- **React-Ready**: Component structure maps directly to React components
- **Hot Reloadable**: Individual files can be modified without full page refresh
- **IDE Friendly**: Clear imports and exports for better IntelliSense

### 🧪 **Testing**
- **Comprehensive Coverage**: 19 backend + 26 frontend tests
- **Component Testing**: Each module has isolated test functions
- **Integration Testing**: End-to-end workflow validation
- **Performance Testing**: Large dataset rendering benchmarks

## API Endpoints

### Course Management
- `GET /api/courses/` - List all courses
- `GET /api/courses/{id}/` - Course details
- `GET /api/conflicts/?course_ids=1,2,3` - Conflict detection

### Schedule Management (Authenticated)
- `GET /api/schedule/` - User's current schedule
- `POST /api/schedule/add/` - Add course to schedule
- `DELETE /api/schedule/remove/{id}/` - Remove from schedule

## File Size Reduction

### Before (Monolithic)
- `index.html`: **~1,200 lines** (HTML + CSS + JS)

### After (Modular)
- `index.html`: **~80 lines** (clean structure only)
- CSS files: **~500 lines** total (organized by purpose)
- JS files: **~700 lines** total (organized by function)

**Result**: **60% reduction** in main template size, **improved maintainability**

## Running the Application

### Development Setup
```bash
# Backend
python manage.py runserver

# Testing
python manage.py test scheduler.tests                 # Backend tests
# Open browser console: CourseplannerTests.runAllTests()  # Frontend tests
```

### Production Deployment
- **Static Files**: `python manage.py collectstatic`
- **Database**: Switch to PostgreSQL in settings.py
- **Web Server**: Configure nginx/Apache to serve static files
- **WSGI**: Use gunicorn or similar for Django app

## Future Transition to React

### Migration Path
1. **Phase 1**: Current modular structure (✅ Complete)
2. **Phase 2**: Component mapping (utils/ → hooks/, components/ → React components)
3. **Phase 3**: State management (appState.js → Redux/Context)
4. **Phase 4**: Build system (webpack, babel, etc.)

### React Component Mapping
```javascript
// Current structure → React equivalent
courseList.js       → <CourseList /> component
scheduleGrid.js     → <ScheduleGrid /> component
modal.js           → <CourseModal /> component
appState.js        → useContext() or Redux store
timeUtils.js       → Custom hooks (useTimeCalculation)
api.js             → React Query or SWR hooks
```

This organized structure provides a solid foundation for both continued vanilla JS development and future React migration, while maintaining clean, maintainable, and testable code.
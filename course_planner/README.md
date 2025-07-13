# JI Course Planner MVP

A simple course planning application for JI students with drag-and-drop scheduling functionality.

## Features

- **Interactive Schedule Grid**: Drag and drop courses onto a weekly schedule
- **Conflict Detection**: Automatically detects and warns about time conflicts
- **Course Database**: Stores course information with time slots, credits, and difficulty
- **Semester Planning**: Switch between Fall and Spring semesters
- **Statistics**: Track total credits, courses, difficulty, and workload
- **Search & Filter**: Find courses by name/code and filter by semester availability

## Quick Setup

### 1. Create Django Project
```bash
# Create new Django project
django-admin startproject course_planner
cd course_planner

# Create scheduler app
python manage.py startapp scheduler
```

### 2. File Structure
```
course_planner/
├── course_planner/
│   ├── __init__.py
│   ├── settings.py          # Use the settings.py artifact
│   ├── urls.py              # Use the project URLs artifact
│   └── wsgi.py
├── scheduler/
│   ├── __init__.py
│   ├── models.py            # Use the models artifact
│   ├── views.py             # Use the views artifact
│   ├── urls.py              # Use the scheduler URLs artifact
│   ├── templates/
│   │   └── scheduler/
│   │       └── index.html   # Use the HTML template artifact
│   └── management/
│       └── commands/
│           └── populate_courses.py  # Use the populate script
└── manage.py
```

### 3. Setup Database
```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Populate sample data
python manage.py populate_courses
```

### 4. Run Server
```bash
python manage.py runserver
```

Visit `http://localhost:8000` to see the application.

## How It Works

### Backend (Django)
- **Models**: Simple Course and UserSchedule models
- **API Endpoints**: RESTful APIs for courses and schedule management
- **Database**: SQLite for development (easily upgradeable to PostgreSQL)

### Frontend (JavaScript)
- **Drag & Drop**: Native HTML5 drag and drop API
- **Grid Layout**: CSS Grid for the schedule layout
- **Conflict Detection**: Real-time conflict checking via API
- **Responsive Design**: Mobile-friendly interface

## Key Components

### Course Model
- Course code, name, credits, description
- Time slots (JSON field with day/start/end)
- Available semesters, difficulty level, workload hours
- Prerequisites (many-to-many relationship)

### Schedule Management
- Drag courses from sidebar to schedule grid
- Automatic conflict detection and warnings
- Semester switching (Fall/Spring)
- Real-time statistics updates

### API Endpoints
- `GET /api/courses/` - List all courses
- `GET /api/courses/{id}/` - Course details
- `GET /api/schedule/` - User's schedule
- `POST /api/schedule/add/` - Add course to schedule
- `DELETE /api/schedule/remove/{id}/` - Remove from schedule
- `GET /api/conflicts/` - Check schedule conflicts

## Sample Data

The `populate_courses.py` management command creates sample JI courses:
- VE280: Programming and Elementary Data Structures
- VE281: Data Structures and Algorithms
- VE270: Introduction to Logic Design
- VE203: Discrete Mathematics
- VE215: Introduction to Circuits
- VE216: Introduction to Signals and Systems
- VE370: Computer Organization
- VE482: Introduction to Operating Systems

## Next Steps for Production

1. **User Authentication**: Add proper login/registration
2. **Database**: Switch to PostgreSQL
3. **Course Data**: Import real course data from university systems
4. **Advanced Features**: Add recommendation system, prerequisites checking
5. **Mobile App**: Create React Native or Flutter mobile app
6. **Deployment**: Deploy on AWS/Azure with proper CI/CD

## Architecture Benefits

- **Simple**: Easy to understand and maintain
- **Scalable**: Can easily add more features
- **Modern**: Uses current web technologies
- **Responsive**: Works on desktop and mobile
- **Extensible**: Easy to add new course attributes or features

This MVP provides a solid foundation for a comprehensive course planning system while keeping the codebase simple and maintainable.
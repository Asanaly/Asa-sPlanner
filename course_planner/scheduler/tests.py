from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.management import call_command
import json
from .models import Course, UserSchedule

class CourseModelTest(TestCase):
    def setUp(self):
        self.course_data = {
            'code': 'VE281',
            'name': 'Data Structures and Algorithms',
            'credits': 4,
            'description': 'Test description',
            'time_slots': [
                {'day': 'Mon', 'start': '09:30', 'end': '11:00'},
                {'day': 'Wed', 'start': '09:30', 'end': '11:00'}
            ],
            'available_semesters': ['fall', 'spring'],
            'difficulty_level': 4,
            'workload_hours': 12
        }
    
    def test_course_creation(self):
        """Test creating a course with all fields"""
        course = Course.objects.create(**self.course_data)
        self.assertEqual(course.code, 'VE281')
        self.assertEqual(course.name, 'Data Structures and Algorithms')
        self.assertEqual(course.credits, 4)
        self.assertEqual(len(course.time_slots), 2)
        self.assertEqual(course.difficulty_level, 4)
    
    def test_course_string_representation(self):
        """Test course __str__ method"""
        course = Course.objects.create(**self.course_data)
        self.assertEqual(str(course), 'VE281 - Data Structures and Algorithms')
    
    def test_course_prerequisites(self):
        """Test course prerequisites relationship"""
        # Create prerequisite course
        prereq_course = Course.objects.create(
            code='VE280',
            name='Programming Basics',
            credits=3,
            time_slots=[{'day': 'Tue', 'start': '10:00', 'end': '11:30'}],
            available_semesters=['fall'],
            difficulty_level=3,
            workload_hours=10
        )
        
        # Create main course
        main_course = Course.objects.create(**self.course_data)
        main_course.prerequisites.add(prereq_course)
        
        self.assertEqual(main_course.prerequisites.count(), 1)
        self.assertEqual(main_course.prerequisites.first(), prereq_course)

class UserScheduleModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.course = Course.objects.create(
            code='VE281',
            name='Data Structures and Algorithms',
            credits=4,
            time_slots=[{'day': 'Mon', 'start': '09:30', 'end': '11:00'}],
            available_semesters=['fall'],
            difficulty_level=4,
            workload_hours=12
        )
    
    def test_user_schedule_creation(self):
        """Test creating a user schedule entry"""
        schedule = UserSchedule.objects.create(
            user=self.user,
            course=self.course,
            semester='fall',
            year=2025
        )
        self.assertEqual(schedule.user, self.user)
        self.assertEqual(schedule.course, self.course)
        self.assertEqual(schedule.semester, 'fall')
        self.assertEqual(schedule.year, 2025)
    
    def test_user_schedule_unique_constraint(self):
        """Test that duplicate schedule entries are prevented"""
        UserSchedule.objects.create(
            user=self.user,
            course=self.course,
            semester='fall',
            year=2025
        )
        
        # Try to create duplicate - should raise error
        with self.assertRaises(Exception):
            UserSchedule.objects.create(
                user=self.user,
                course=self.course,
                semester='fall',
                year=2025
            )

class CourseAPITest(TestCase):
    def setUp(self):
        self.client = Client()
        self.course1 = Course.objects.create(
            code='VE281',
            name='Data Structures and Algorithms',
            credits=4,
            description='Advanced programming course',
            time_slots=[
                {'day': 'Mon', 'start': '09:30', 'end': '11:00'},
                {'day': 'Wed', 'start': '09:30', 'end': '11:00'}
            ],
            available_semesters=['fall', 'spring'],
            difficulty_level=4,
            workload_hours=12
        )
        self.course2 = Course.objects.create(
            code='VE280',
            name='Programming Basics',
            credits=3,
            time_slots=[{'day': 'Tue', 'start': '10:00', 'end': '11:30'}],
            available_semesters=['fall'],
            difficulty_level=3,
            workload_hours=10
        )
    
    def test_api_courses_list(self):
        """Test GET /api/courses/ endpoint"""
        response = self.client.get('/api/courses/')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertIn('courses', data)
        self.assertEqual(len(data['courses']), 2)
        
        # Check first course data
        course_data = data['courses'][0]
        self.assertIn('id', course_data)
        self.assertIn('code', course_data)
        self.assertIn('name', course_data)
        self.assertIn('credits', course_data)
        self.assertIn('time_slots', course_data)
    
    def test_api_course_detail(self):
        """Test GET /api/courses/{id}/ endpoint"""
        response = self.client.get(f'/api/courses/{self.course1.id}/')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertEqual(data['code'], 'VE281')
        self.assertEqual(data['name'], 'Data Structures and Algorithms')
        self.assertEqual(data['credits'], 4)
        self.assertEqual(len(data['time_slots']), 2)
    
    def test_api_course_detail_not_found(self):
        """Test GET /api/courses/{id}/ with invalid ID"""
        response = self.client.get('/api/courses/9999/')
        self.assertEqual(response.status_code, 404)
        
        data = json.loads(response.content)
        self.assertIn('error', data)

class ConflictDetectionTest(TestCase):
    def setUp(self):
        self.client = Client()
        # Course with Monday 9:30-11:00
        self.course1 = Course.objects.create(
            code='VE281',
            name='Data Structures',
            credits=4,
            time_slots=[{'day': 'Mon', 'start': '09:30', 'end': '11:00'}],
            available_semesters=['fall'],
            difficulty_level=4,
            workload_hours=12
        )
        # Course with Monday 10:30-12:00 (overlaps with course1)
        self.course2 = Course.objects.create(
            code='VE270',
            name='Logic Design',
            credits=4,
            time_slots=[{'day': 'Mon', 'start': '10:30', 'end': '12:00'}],
            available_semesters=['fall'],
            difficulty_level=3,
            workload_hours=10
        )
        # Course with Tuesday (no conflict)
        self.course3 = Course.objects.create(
            code='VE280',
            name='Programming',
            credits=3,
            time_slots=[{'day': 'Tue', 'start': '09:30', 'end': '11:00'}],
            available_semesters=['fall'],
            difficulty_level=3,
            workload_hours=10
        )
    
    def test_conflict_detection_with_overlap(self):
        """Test conflict detection with overlapping courses"""
        response = self.client.get(f'/api/conflicts/?course_ids={self.course1.id},{self.course2.id}')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertIn('conflicts', data)
        self.assertEqual(len(data['conflicts']), 1)
        
        conflict = data['conflicts'][0]
        # Check that both courses are present (order doesn't matter)
        course_codes = {conflict['course1'], conflict['course2']}
        self.assertEqual(course_codes, {'VE281', 'VE270'})
        self.assertEqual(conflict['day'], 'Mon')
        
    def test_conflict_detection_no_overlap(self):
        """Test conflict detection with non-overlapping courses"""
        response = self.client.get(f'/api/conflicts/?course_ids={self.course1.id},{self.course3.id}')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertIn('conflicts', data)
        self.assertEqual(len(data['conflicts']), 0)
    
    def test_conflict_detection_single_course(self):
        """Test conflict detection with single course (should return no conflicts)"""
        response = self.client.get(f'/api/conflicts/?course_ids={self.course1.id}')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertEqual(len(data['conflicts']), 0)

class UserScheduleAPITest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.course = Course.objects.create(
            code='VE281',
            name='Data Structures',
            credits=4,
            time_slots=[{'day': 'Mon', 'start': '09:30', 'end': '11:00'}],
            available_semesters=['fall'],
            difficulty_level=4,
            workload_hours=12
        )
        self.client.login(username='testuser', password='testpass123')
    
    def test_add_course_to_schedule(self):
        """Test POST /api/schedule/add/ endpoint"""
        data = {
            'course_id': self.course.id,
            'semester': 'fall',
            'year': 2025,
            'position_data': {'x': 0, 'y': 0}
        }
        response = self.client.post(
            '/api/schedule/add/',
            json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        
        response_data = json.loads(response.content)
        self.assertTrue(response_data['success'])
        self.assertIn('schedule_id', response_data)
        
        # Verify schedule was created
        schedule = UserSchedule.objects.get(id=response_data['schedule_id'])
        self.assertEqual(schedule.user, self.user)
        self.assertEqual(schedule.course, self.course)
    
    def test_add_duplicate_course_to_schedule(self):
        """Test adding duplicate course to schedule"""
        # Add course first time
        UserSchedule.objects.create(
            user=self.user,
            course=self.course,
            semester='fall',
            year=2025
        )
        
        # Try to add same course again
        data = {
            'course_id': self.course.id,
            'semester': 'fall',
            'year': 2025
        }
        response = self.client.post(
            '/api/schedule/add/',
            json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        
        response_data = json.loads(response.content)
        self.assertIn('error', response_data)
    
    def test_get_user_schedule(self):
        """Test GET /api/schedule/ endpoint"""
        # Create schedule entry
        schedule = UserSchedule.objects.create(
            user=self.user,
            course=self.course,
            semester='fall',
            year=2025
        )
        
        response = self.client.get('/api/schedule/')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertIn('schedule', data)
        self.assertEqual(len(data['schedule']), 1)
        
        schedule_data = data['schedule'][0]
        self.assertEqual(schedule_data['semester'], 'fall')
        self.assertEqual(schedule_data['year'], 2025)
        self.assertEqual(schedule_data['course']['code'], 'VE281')
    
    def test_remove_course_from_schedule(self):
        """Test DELETE /api/schedule/remove/{id}/ endpoint"""
        # Create schedule entry
        schedule = UserSchedule.objects.create(
            user=self.user,
            course=self.course,
            semester='fall',
            year=2025
        )
        
        response = self.client.delete(f'/api/schedule/remove/{schedule.id}/')
        self.assertEqual(response.status_code, 200)
        
        # Verify schedule was deleted
        self.assertFalse(UserSchedule.objects.filter(id=schedule.id).exists())

class ManagementCommandTest(TestCase):
    def test_populate_courses_command(self):
        """Test the populate_courses management command"""
        # Verify no courses exist initially
        self.assertEqual(Course.objects.count(), 0)
        
        # Run the command
        call_command('populate_courses')
        
        # Verify courses were created
        self.assertGreater(Course.objects.count(), 0)
        
        # Check specific course exists
        ve281 = Course.objects.filter(code='VE281').first()
        self.assertIsNotNone(ve281)
        self.assertEqual(ve281.name, 'Data Structures and Algorithms')
        self.assertGreater(len(ve281.time_slots), 0)
        
        # Check prerequisites were set
        ve281 = Course.objects.get(code='VE281')
        ve280 = Course.objects.get(code='VE280')
        self.assertIn(ve280, ve281.prerequisites.all())

class ViewTest(TestCase):
    def setUp(self):
        self.client = Client()
    
    def test_index_view(self):
        """Test the main index view loads correctly"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'JI Course Planner')
        self.assertContains(response, 'Available Courses')
        self.assertContains(response, 'schedule-grid')

class AuthenticationTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.course = Course.objects.create(
            code='VE281',
            name='Data Structures',
            credits=4,
            time_slots=[{'day': 'Mon', 'start': '09:30', 'end': '11:00'}],
            available_semesters=['fall'],
            difficulty_level=4,
            workload_hours=12
        )
    
    def test_unauthenticated_schedule_access(self):
        """Test that unauthenticated users can't access schedule endpoints"""
        response = self.client.get('/api/schedule/')
        self.assertEqual(response.status_code, 302)  # Redirect to login
        
        response = self.client.post(
            '/api/schedule/add/',
            json.dumps({'course_id': self.course.id}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 302)  # Redirect to login
    
    def test_authenticated_schedule_access(self):
        """Test that authenticated users can access schedule endpoints"""
        self.client.login(username='testuser', password='testpass123')
        
        response = self.client.get('/api/schedule/')
        self.assertEqual(response.status_code, 200)
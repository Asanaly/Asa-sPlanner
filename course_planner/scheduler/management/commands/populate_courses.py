from scheduler.models import Course
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Populate database with sample JI courses'
    
    def handle(self, *args, **options):
        # Sample JI courses with realistic data including grade levels
        courses_data = [
            {
                'code': 'VE280',
                'name': 'Programming and Elementary Data Structures',
                'credits': 4,
                'description': 'Introduction to programming and basic data structures',
                'time_slots': [
                    {'day': 'Tue', 'start': '15:30', 'end': '17:00'},
                    {'day': 'Thu', 'start': '15:30', 'end': '17:00'}
                ],
                'available_semesters': ['fall', 'spring'],
                'difficulty_level': 3,
                'workload_hours': 10,
                'grade_level': 'freshman'
            },
            {
                'code': 'VE203',
                'name': 'Discrete Mathematics',
                'credits': 4,
                'description': 'Mathematical foundations for computer science',
                'time_slots': [
                    {'day': 'Mon', 'start': '13:30', 'end': '15:00'},
                    {'day': 'Wed', 'start': '13:30', 'end': '15:00'},
                    {'day': 'Fri', 'start': '13:30', 'end': '15:00'}
                ],
                'available_semesters': ['fall', 'spring'],
                'difficulty_level': 4,
                'workload_hours': 11,
                'grade_level': 'freshman'
            },
            {
                'code': 'VE215',
                'name': 'Introduction to Circuits',
                'credits': 4,
                'description': 'Basic circuit analysis and design',
                'time_slots': [
                    {'day': 'Mon', 'start': '10:30', 'end': '12:00'},
                    {'day': 'Wed', 'start': '10:30', 'end': '12:00'},
                    {'day': 'Fri', 'start': '10:30', 'end': '12:00'}
                ],
                'available_semesters': ['fall', 'spring'],
                'difficulty_level': 3,
                'workload_hours': 9,
                'grade_level': 'freshman'
            },
            {
                'code': 'VE281',
                'name': 'Data Structures and Algorithms',
                'credits': 4,
                'description': 'This course provides an introduction to fundamental data structures and algorithms. Topics include dynamic arrays, linked lists, stacks, queues, trees, graphs, sorting algorithms, and algorithm analysis. Students will learn to implement these data structures and analyze their time and space complexity.',
                'time_slots': [
                    {'day': 'Mon', 'start': '09:30', 'end': '11:00'},
                    {'day': 'Wed', 'start': '09:30', 'end': '11:00'},
                    {'day': 'Fri', 'start': '09:30', 'end': '11:00'}
                ],
                'available_semesters': ['fall', 'spring'],
                'difficulty_level': 4,
                'workload_hours': 12,
                'grade_level': 'sophomore'
            },
            {
                'code': 'VE270',
                'name': 'Introduction to Logic Design',
                'credits': 4,
                'description': 'Digital logic design and computer organization',
                'time_slots': [
                    {'day': 'Tue', 'start': '10:30', 'end': '12:00'},
                    {'day': 'Thu', 'start': '10:30', 'end': '12:00'}
                ],
                'available_semesters': ['fall', 'spring'],
                'difficulty_level': 3,
                'workload_hours': 10,
                'grade_level': 'sophomore'
            },
            {
                'code': 'VE216',
                'name': 'Introduction to Signals and Systems',
                'credits': 4,
                'description': 'Signal processing and system analysis',
                'time_slots': [
                    {'day': 'Tue', 'start': '09:00', 'end': '10:30'},
                    {'day': 'Thu', 'start': '09:00', 'end': '10:30'}
                ],
                'available_semesters': ['fall', 'spring'],
                'difficulty_level': 4,
                'workload_hours': 11,
                'grade_level': 'sophomore'
            },
            {
                'code': 'VE370',
                'name': 'Computer Organization',
                'credits': 4,
                'description': 'Computer architecture and assembly programming',
                'time_slots': [
                    {'day': 'Mon', 'start': '15:30', 'end': '17:00'},
                    {'day': 'Wed', 'start': '15:30', 'end': '17:00'}
                ],
                'available_semesters': ['fall', 'spring'],
                'difficulty_level': 4,
                'workload_hours': 12,
                'grade_level': 'junior'
            },
            {
                'code': 'VE482',
                'name': 'Introduction to Operating Systems',
                'credits': 4,
                'description': 'Operating system concepts and implementation',
                'time_slots': [
                    {'day': 'Tue', 'start': '13:30', 'end': '15:00'},
                    {'day': 'Thu', 'start': '13:30', 'end': '15:00'}
                ],
                'available_semesters': ['fall', 'spring'],
                'difficulty_level': 5,
                'workload_hours': 15,
                'grade_level': 'senior'
            },
            {
                'code': 'VE401',
                'name': 'Machine Learning Intensive',
                'credits': 3,
                'description': 'Intensive summer course covering machine learning fundamentals',
                'time_slots': [
                    {'day': 'Mon', 'start': '09:00', 'end': '12:00'},
                    {'day': 'Wed', 'start': '09:00', 'end': '12:00'},
                    {'day': 'Fri', 'start': '09:00', 'end': '12:00'}
                ],
                'available_semesters': ['summer'],
                'difficulty_level': 4,
                'workload_hours': 15,
                'grade_level': 'senior'
            }
        ]
        
        # Create or update courses
        for course_data in courses_data:
            course, created = Course.objects.get_or_create(
                code=course_data['code'],
                defaults=course_data
            )
            
            if created:
                self.stdout.write(f'Created course: {course.code} ({course_data["grade_level"]})')
            else:
                # Update existing course with all fields from course_data
                updated = False
                for field, value in course_data.items():
                    if field != 'code':  # Don't update the code field
                        current_value = getattr(course, field)
                        if current_value != value:
                            setattr(course, field, value)
                            updated = True
                
                if updated:
                    course.save()
                    self.stdout.write(f'Updated course: {course.code} with grade level {course_data["grade_level"]}')
                else:
                    self.stdout.write(f'Course already up to date: {course.code}')
        
        # Add some prerequisites
        try:
            ve280 = Course.objects.get(code='VE280')
            ve281 = Course.objects.get(code='VE281')
            ve370 = Course.objects.get(code='VE370')
            ve482 = Course.objects.get(code='VE482')
            ve270 = Course.objects.get(code='VE270')
            
            # Clear existing prerequisites first
            ve281.prerequisites.clear()
            ve370.prerequisites.clear()
            ve482.prerequisites.clear()
            
            # VE281 requires VE280
            ve281.prerequisites.add(ve280)
            
            # VE370 requires VE280 and VE270
            ve370.prerequisites.add(ve280, ve270)
            
            # VE482 requires VE281 and VE370
            ve482.prerequisites.add(ve281, ve370)
            
            self.stdout.write('Added prerequisites')
            
        except Course.DoesNotExist:
            self.stdout.write('Some courses not found for prerequisites')
        
        self.stdout.write(self.style.SUCCESS('Database populated successfully with grade levels!'))
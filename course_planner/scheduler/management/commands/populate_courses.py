from django.core.management.base import BaseCommand
from scheduler.models import Course

class Command(BaseCommand):
    help = 'Populate database with sample JI courses'
    
    def handle(self, *args, **options):
        # Sample JI courses with realistic data
        courses_data = [
            {
                'code': 'VE281',
                'name': 'Data Structures and Algorithms',
                'credits': 4,
                'description': 'Introduction to fundamental data structures and algorithms',
                'time_slots': [
                    {'day': 'Mon', 'start': '09:00', 'end': '10:30'},
                    {'day': 'Wed', 'start': '09:00', 'end': '10:30'},
                    {'day': 'Fri', 'start': '09:00', 'end': '10:30'}
                ],
                'available_semesters': ['fall', 'spring'],
                'difficulty_level': 4,
                'workload_hours': 12
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
                'workload_hours': 10
            },
            {
                'code': 'VE203',
                'name': 'Discrete Mathematics',
                'credits': 4,
                'description': 'Mathematical foundations for computer science',
                'time_slots': [
                    {'day': 'Tue', 'start': '9:30', 'end': '15:00'},
                    {'day': 'Wed', 'start': '13:30', 'end': '15:00'},
                    {'day': 'Fri', 'start': '13:30', 'end': '15:00'}
                ],
                'available_semesters': ['fall', 'spring'],
                'difficulty_level': 4,
                'workload_hours': 11
            },
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
                'workload_hours': 10
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
                'workload_hours': 9
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
                'workload_hours': 11
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
                'workload_hours': 12
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
                'workload_hours': 15
            }
        ]
        
        # Create courses
        for course_data in courses_data:
            course, created = Course.objects.get_or_create(
                code=course_data['code'],
                defaults=course_data
            )
            if created:
                self.stdout.write(f'Created course: {course.code}')
            else:
                self.stdout.write(f'Course already exists: {course.code}')
        
        # Add some prerequisites
        try:
            ve280 = Course.objects.get(code='VE280')
            ve281 = Course.objects.get(code='VE281')
            ve370 = Course.objects.get(code='VE370')
            ve482 = Course.objects.get(code='VE482')
            ve270 = Course.objects.get(code='VE270')
            
            # VE281 requires VE280
            ve281.prerequisites.add(ve280)
            
            # VE370 requires VE280 and VE270
            ve370.prerequisites.add(ve280, ve270)
            
            # VE482 requires VE281 and VE370
            ve482.prerequisites.add(ve281, ve370)
            
            self.stdout.write('Added prerequisites')
            
        except Course.DoesNotExist:
            self.stdout.write('Some courses not found for prerequisites')
        
        self.stdout.write(self.style.SUCCESS('Database populated successfully!'))
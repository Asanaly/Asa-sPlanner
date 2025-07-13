# scheduler/management/commands/clear_courses.py
from django.core.management.base import BaseCommand
from scheduler.models import Course

class Command(BaseCommand):
    help = 'Delete all courses from database'
    
    def handle(self, *args, **options):
        course_count = Course.objects.count()
        Course.objects.all().delete()
        self.stdout.write(
            self.style.SUCCESS(f'Successfully deleted {course_count} courses')
        )
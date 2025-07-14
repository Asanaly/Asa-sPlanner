from django.db import models
from django.contrib.auth.models import User

class Course(models.Model):
    """Simple course model with essential fields"""
    code = models.CharField(max_length=20, unique=True)  # e.g., "VE281"
    name = models.CharField(max_length=200)  # e.g., "Data Structures and Algorithms"
    credits = models.IntegerField(default=3)
    description = models.TextField(blank=True)
    prerequisites = models.ManyToManyField('self', blank=True, symmetrical=False)
    
    # Time slots - keeping it simple with string format
    time_slots = models.JSONField(default=list)  # [{"day": "Mon", "start": "09:00", "end": "10:30"}, ...]
    
    # Semester availability
    SEMESTER_CHOICES = [
        ('fall', 'Fall'),
        ('spring', 'Spring'),
        ('summer', 'Summer'),
    ]
    available_semesters = models.JSONField(default=list)  # ["fall", "spring"]
    
    # Grade level for academic planning
    GRADE_LEVEL_CHOICES = [
        ('freshman', 'Freshman'),
        ('sophomore', 'Sophomore'),
        ('junior', 'Junior'),
        ('senior', 'Senior'),
        ('general', 'General'),
    ]
    grade_level = models.CharField(
        max_length=20,
        choices=GRADE_LEVEL_CHOICES,
        default='general'
    )
    
    # Basic metadata
    difficulty_level = models.IntegerField(default=3, choices=[(i, i) for i in range(1, 6)])  # 1-5 scale
    workload_hours = models.IntegerField(default=10)  # estimated hours per week
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    class Meta:
        ordering = ['code']

class UserSchedule(models.Model):
    """User's planned schedule for different semesters"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    semester = models.CharField(max_length=20, choices=Course.SEMESTER_CHOICES)
    year = models.IntegerField()  # e.g., 2025
    
    # Position in the schedule grid (for UI state)
    position_data = models.JSONField(default=dict)  # {"x": 0, "y": 0} or similar
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'course', 'semester', 'year']
        ordering = ['year', 'semester', 'course__code']
    
    def __str__(self):
        return f"{self.user.username} - {self.course.code} ({self.semester} {self.year})"
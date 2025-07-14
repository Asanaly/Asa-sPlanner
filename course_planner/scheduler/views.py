from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
import json
from .models import Course, UserSchedule

def index(request):
    """Serve the main scheduler page"""
    return render(request, 'scheduler/index.html')

def api_courses(request):
    """API endpoint to get all courses"""
    courses = Course.objects.all()
    courses_data = []
    
    for course in courses:
        courses_data.append({
            'id': course.id,
            'code': course.code,
            'name': course.name,
            'credits': course.credits,
            'description': course.description,
            'time_slots': course.time_slots,
            'available_semesters': course.available_semesters,
            'difficulty_level': course.difficulty_level,
            'workload_hours': course.workload_hours,
            'grade_level': course.grade_level,  # ADD THIS LINE
            'prerequisites': [p.code for p in course.prerequisites.all()]
        })
    
    return JsonResponse({'courses': courses_data})

def api_course_detail(request, course_id):
    """Get detailed information about a specific course"""
    try:
        course = Course.objects.get(id=course_id)
        course_data = {
            'id': course.id,
            'code': course.code,
            'name': course.name,
            'credits': course.credits,
            'description': course.description,
            'time_slots': course.time_slots,
            'available_semesters': course.available_semesters,
            'difficulty_level': course.difficulty_level,
            'workload_hours': course.workload_hours,
            'grade_level': course.grade_level,  # ADD THIS LINE TOO
            'prerequisites': [p.code for p in course.prerequisites.all()]
        }
        return JsonResponse(course_data)
    except Course.DoesNotExist:
        return JsonResponse({'error': 'Course not found'}, status=404)
@login_required
def api_user_schedule(request):
    """Get user's current schedule"""
    schedules = UserSchedule.objects.filter(user=request.user)
    schedule_data = []
    
    for schedule in schedules:
        schedule_data.append({
            'id': schedule.id,
            'course': {
                'id': schedule.course.id,
                'code': schedule.course.code,
                'name': schedule.course.name,
                'credits': schedule.course.credits,
                'time_slots': schedule.course.time_slots
            },
            'semester': schedule.semester,
            'year': schedule.year,
            'position_data': schedule.position_data
        })
    
    return JsonResponse({'schedule': schedule_data})

@csrf_exempt
@login_required
@require_http_methods(["POST"])
def api_add_to_schedule(request):
    """Add a course to user's schedule"""
    try:
        data = json.loads(request.body)
        course_id = data.get('course_id')
        semester = data.get('semester')
        year = data.get('year')
        position_data = data.get('position_data', {})
        
        course = Course.objects.get(id=course_id)
        
        # Check if already in schedule
        if UserSchedule.objects.filter(user=request.user, course=course, 
                                     semester=semester, year=year).exists():
            return JsonResponse({'error': 'Course already in schedule'}, status=400)
        
        # Create schedule entry
        schedule = UserSchedule.objects.create(
            user=request.user,
            course=course,
            semester=semester,
            year=year,
            position_data=position_data
        )
        
        return JsonResponse({'success': True, 'schedule_id': schedule.id})
        
    except Course.DoesNotExist:
        return JsonResponse({'error': 'Course not found'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@login_required
@require_http_methods(["DELETE"])
def api_remove_from_schedule(request, schedule_id):
    """Remove a course from user's schedule"""
    try:
        schedule = UserSchedule.objects.get(id=schedule_id, user=request.user)
        schedule.delete()
        return JsonResponse({'success': True})
    except UserSchedule.DoesNotExist:
        return JsonResponse({'error': 'Schedule entry not found'}, status=404)

def api_check_conflicts(request):
    """Check for time conflicts between courses"""
    try:
        course_ids = request.GET.get('course_ids', '').split(',')
        course_ids = [int(id) for id in course_ids if id.strip()]
        
        if len(course_ids) < 2:
            return JsonResponse({'conflicts': []})
        
        courses = Course.objects.filter(id__in=course_ids)
        conflicts = []
        
        # Simple conflict detection - check if time slots overlap
        for i, course1 in enumerate(courses):
            for j, course2 in enumerate(courses):
                if i >= j:
                    continue
                    
                # Check if any time slots overlap
                for slot1 in course1.time_slots:
                    for slot2 in course2.time_slots:
                        if (slot1['day'] == slot2['day'] and 
                            time_overlap(slot1['start'], slot1['end'], 
                                       slot2['start'], slot2['end'])):
                            conflicts.append({
                                'course1': course1.code,
                                'course2': course2.code,
                                'day': slot1['day'],
                                'time1': f"{slot1['start']}-{slot1['end']}",
                                'time2': f"{slot2['start']}-{slot2['end']}"
                            })
        
        return JsonResponse({'conflicts': conflicts})
        
    except ValueError:
        return JsonResponse({'error': 'Invalid course IDs'}, status=400)

def time_overlap(start1, end1, start2, end2):
    """Check if two time ranges overlap"""
    def time_to_minutes(time_str):
        hours, minutes = map(int, time_str.split(':'))
        return hours * 60 + minutes
    
    s1, e1 = time_to_minutes(start1), time_to_minutes(end1)
    s2, e2 = time_to_minutes(start2), time_to_minutes(end2)
    
    return not (e1 <= s2 or e2 <= s1)

from django.urls import path
from . import views

app_name = 'scheduler'

urlpatterns = [
    # Main page
    path('', views.index, name='index'),
    
    # API endpoints
    path('api/courses/', views.api_courses, name='api_courses'),
    path('api/courses/<int:course_id>/', views.api_course_detail, name='api_course_detail'),
    path('api/schedule/', views.api_user_schedule, name='api_user_schedule'),
    path('api/schedule/add/', views.api_add_to_schedule, name='api_add_to_schedule'),
    path('api/schedule/remove/<int:schedule_id>/', views.api_remove_from_schedule, name='api_remove_from_schedule'),
    path('api/conflicts/', views.api_check_conflicts, name='api_check_conflicts'),
]
// Application configuration and constants
window.CONFIG = {
    // Course color palette
    COURSE_COLORS: [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'linear-gradient(135deg, #ff8a80 0%, #ea4c89 100%)',
        'linear-gradient(135deg, #8ec5fc 0%, #e0c3fc 100%)',
        'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)'
    ],
    
    // Time slots for the schedule grid
    TIME_SLOTS: [
        '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
        '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', 
        '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00',
        '20:00-21:00', '21:00-22:00'
    ],
    
    // Days of the week
    DAYS: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    
    // API endpoints
    API: {
        COURSES: '/api/courses/',
        COURSE_DETAIL: '/api/courses/{id}/',
        SCHEDULE: '/api/schedule/',
        SCHEDULE_ADD: '/api/schedule/add/',
        SCHEDULE_REMOVE: '/api/schedule/remove/{id}/',
        CONFLICTS: '/api/conflicts/'
    },
    
    // Grid configuration
    GRID: {
        TIME_HEADER_WIDTH: '100px',
        CELL_HEIGHT: '60px',
        CELL_GAP: '2px'
    },
    
    // Animation timings
    ANIMATIONS: {
        HIGHLIGHT_DURATION: 3000,
        MODAL_TRANSITION: 300,
        DRAG_TRANSITION: 300
    }
};
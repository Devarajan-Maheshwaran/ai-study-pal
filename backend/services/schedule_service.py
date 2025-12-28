def generate_schedule(hours=5, subject="General"):
    sessions = []
    hour_per_session = hours / 3
    activities = ['Revise concepts', 'Practice MCQs', 'Attempt mock quiz']
    for i, activity in enumerate(activities):
        sessions.append({'session': i+1, 'activity': activity, 'hours': hour_per_session, 'subject': subject})
    return sessions

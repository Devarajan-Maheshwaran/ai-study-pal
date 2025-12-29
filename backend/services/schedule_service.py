def generate_schedule(subject, hours, scenario="standard"):
    """Generate study schedule."""
    schedule_data = []
    sessions = max(1, int(hours // 1))
    per_session = hours / sessions if sessions > 0 else hours
    
    for i in range(sessions):
        schedule_data.append({
            'session': i + 1,
            'subject': subject,
            'scenario': scenario,
            'planned_hours': round(per_session, 1),
            'activity': f'Review and practice {subject} concepts'
        })
    
    return schedule_data

def schedule_to_csv(schedule_data):
    """Convert schedule to CSV format."""
    lines = ['Session,Subject,Scenario,Planned Hours,Activity
']
    for item in schedule_data:
        line = f"{item['session']},{item['subject']},{item['scenario']},{item['planned_hours']},{item['activity']}
"
        lines.append(line)
    return ''.join(lines)

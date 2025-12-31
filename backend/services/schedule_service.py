import csv
from io import StringIO

def generate_study_schedule_csv(subject, hours):
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['Session', 'Subject', 'Hours', 'Activity'])
    
    activities = ['Review Concepts', 'Practice Problems', 'Take Quiz', 'Revision']
    hours_per = hours / len(activities)
    
    for i, activity in enumerate(activities, 1):
        writer.writerow([f'Session {i}', subject, round(hours_per, 1), activity])
    
    csv_data = output.getvalue()
    output.close()
    return csv_data

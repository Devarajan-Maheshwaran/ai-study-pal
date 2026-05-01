import csv
from io import StringIO

def generate_study_schedule_csv(subject: str, hours: float, concept_weights: dict = {}):
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['Session', 'Subject', 'Topic', 'Activity', 'Hours', 'Priority'])
    if concept_weights:
        sorted_topics = sorted(concept_weights.items(), key=lambda x: x[1], reverse=True)
        total_used = 0
        for session, (topic, diff) in enumerate(sorted_topics, 1):
            topic_hours = round(hours * min(diff + 0.2, 0.5), 1)
            priority = 'High' if diff > 0.6 else ('Medium' if diff > 0.3 else 'Low')
            activity = 'Intensive Review' if diff > 0.6 else 'Practice Problems'
            writer.writerow([f'Session {session}', subject, topic, activity, topic_hours, priority])
            total_used += topic_hours
        remaining = max(0, round(hours - total_used, 1))
        if remaining > 0:
            writer.writerow([f'Session {len(sorted_topics)+1}', subject, 'All Topics', 'Final Revision', remaining, 'Low'])
    else:
        activities = [
            ('Review Concepts', 'Medium'),
            ('Practice Problems', 'High'),
            ('Take Quiz', 'High'),
            ('Revision', 'Medium')
        ]
        hours_per = round(hours / len(activities), 1)
        for i, (activity, priority) in enumerate(activities, 1):
            writer.writerow([f'Session {i}', subject, 'General', activity, hours_per, priority])
    csv_data = output.getvalue()
    output.close()
    return csv_data

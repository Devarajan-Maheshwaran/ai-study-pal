import csv
from io import StringIO
from datetime import date, timedelta


def generate_study_schedule_csv(
    subject: str,
    hours_per_day: float,
    concept_difficulty: dict,
    start_date: str = None,
) -> str:
    """
    Generate a prioritized study schedule weighted by concept difficulty.
    Returns CSV string.
    """
    today = date.today() if not start_date else date.fromisoformat(start_date)

    # Normalize difficulty scores (0-1 scale)
    if concept_difficulty:
        total_weight = sum(concept_difficulty.values()) or 1
        weighted = {
            topic: round((score / total_weight) * hours_per_day, 2)
            for topic, score in concept_difficulty.items()
        }
    else:
        weighted = {subject: hours_per_day}

    # Sort: hardest topics get scheduled first
    sorted_topics = sorted(weighted.items(), key=lambda x: x[1], reverse=True)

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Subject", "Topic", "Hours", "Priority", "Suggested Activity"])

    priority_labels = ["Critical", "High", "Medium", "Low"]
    activities = [
        "Deep study + practice problems",
        "Concept review + flashcards",
        "Quick revision + self-quiz",
        "Light review + summary read",
    ]

    for i, (topic, hrs) in enumerate(sorted_topics):
        day = today + timedelta(days=i)
        priority = priority_labels[min(i, len(priority_labels) - 1)]
        activity = activities[min(i, len(activities) - 1)]
        writer.writerow([
            day.isoformat(),
            subject,
            topic,
            hrs,
            priority,
            activity,
        ])

    return output.getvalue()

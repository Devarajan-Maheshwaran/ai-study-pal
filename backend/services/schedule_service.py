import csv
import io
import math

def generate_study_schedule_csv(subject: str, hours: float, scenario: str) -> str:
    """
    Splits total hours into sessions and assigns simple activities.
    """
    sessions = max(3, int(math.ceil(hours / 1.5)))
    per_session = hours / sessions

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Session", "Subject", "Scenario", "Planned Hours", "Activity"])

    for i in range(1, sessions + 1):
        if i == 1:
            act = "Revise core concepts"
        elif i == sessions:
            act = "Attempt mixed revision quiz and summarize mistakes"
        else:
            act = "Practice MCQs and review weak topics"
        writer.writerow([i, subject, scenario, round(per_session, 2), act])

    return output.getvalue()

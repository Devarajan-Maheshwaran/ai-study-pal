from __future__ import annotations

import csv
from datetime import datetime, timedelta
from io import StringIO
from typing import List, Dict


def build_simple_schedule(subject: str, hours: int, days: int = 5) -> List[Dict[str, str]]:
    hours_per_day = max(1, hours // max(1, days))
    today = datetime.now().date()

    rows = []
    for i in range(days):
        day = today + timedelta(days=i)
        rows.append({
            "date": day.isoformat(),
            "subject": subject,
            "planned_hours": str(hours_per_day),
            "focus": "review + practice",
        })
    return rows


def make_schedule_csv(subject: str, hours: int) -> bytes:
    schedule = build_simple_schedule(subject, hours)
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=["date", "subject", "planned_hours", "focus"])
    writer.writeheader()
    for row in schedule:
        writer.writerow(row)
    return output.getvalue().encode("utf-8")

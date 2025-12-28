import csv
from pathlib import Path

RESOURCES_FILE = 'data/resources.csv'

def init_resources():
    Path('data').mkdir(exist_ok=True)
    resources = [
        {'subject': 'Python Basics', 'title': 'Python Docs', 'url': 'https://docs.python.org', 'type': 'web'},
        {'subject': 'AIML Fundamentals', 'title': 'ML Tutorial', 'url': 'https://youtu.be/example', 'type': 'youtube'},
    ]
    with open(RESOURCES_FILE, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['subject', 'title', 'url', 'type'])
        writer.writeheader()
        writer.writerows(resources)

def get_resources(subject=None):
    if not Path(RESOURCES_FILE).exists():
        init_resources()
    resources = []
    try:
        with open(RESOURCES_FILE, 'r') as f:
            reader = csv.DictReader(f)
            resources = list(reader)
            if subject:
                resources = [r for r in resources if r['subject'] == subject]
    except:
        pass
    return resources

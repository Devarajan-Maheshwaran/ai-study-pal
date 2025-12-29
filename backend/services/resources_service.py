import csv
import os

RESOURCES_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'resources.csv')

def init_resources():
    """Initialize resources file."""
    if not os.path.exists(RESOURCES_FILE):
        os.makedirs(os.path.dirname(RESOURCES_FILE), exist_ok=True)
        with open(RESOURCES_FILE, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['subject', 'title', 'url', 'type'])
            writer.writerow(['Mathematics', 'Khan Academy Math', 'https://www.khanacademy.org/math', 'web'])
            writer.writerow(['Science', 'Crash Course Science', 'https://www.youtube.com/@crashcourse', 'youtube'])

def get_resources(subject, limit=10):
    """Get resources for a subject."""
    init_resources()
    resources = []
    try:
        with open(RESOURCES_FILE, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['subject'] == subject:
                    resources.append(row)
                    if len(resources) >= limit:
                        break
    except:
        pass
    return resources

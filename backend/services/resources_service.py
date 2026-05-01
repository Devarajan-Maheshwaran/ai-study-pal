import os

CURATED = [
    ('math',       'Khan Academy Math',              'https://www.khanacademy.org/math',                       'article', 1.0),
    ('math',       '3Blue1Brown - Visual Math',      'https://www.youtube.com/@3blue1brown',                  'youtube', 0.7),
    ('physics',    'MIT OCW Physics',                'https://ocw.mit.edu/courses/physics/',                  'article', 0.6),
    ('physics',    'Crash Course Physics',           'https://www.youtube.com/playlist?list=PL8dPuuaLjXtN0ge7yDk_UA0ldZJdhwkoV', 'youtube', 1.0),
    ('chemistry',  'Khan Academy Chemistry',         'https://www.khanacademy.org/science/chemistry',         'article', 1.0),
    ('chemistry',  'Crash Course Chemistry',         'https://www.youtube.com/@crashcourse',                  'youtube', 1.0),
    ('biology',    'Khan Academy Biology',           'https://www.khanacademy.org/science/biology',           'article', 1.0),
    ('biology',    'HHMI BioInteractive',            'https://www.biointeractive.org/',                       'article', 0.5),
    ('cs',         'CS50 Harvard',                   'https://cs50.harvard.edu/x/',                           'article', 1.0),
    ('cs',         'MIT 6.006 Algorithms',           'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/', 'article', 0.4),
    ('programming','freeCodeCamp',                   'https://www.freecodecamp.org/',                         'article', 1.0),
    ('programming','The Odin Project',               'https://www.theodinproject.com/',                       'article', 0.8),
    ('history',    'Khan Academy World History',     'https://www.khanacademy.org/humanities/world-history',  'article', 1.0),
    ('history',    'Crash Course History',           'https://www.youtube.com/@crashcourse',                  'youtube', 1.0),
    ('economics',  'Khan Academy Economics',         'https://www.khanacademy.org/economics-finance-domain', 'article', 1.0),
    ('general',    'Khan Academy',                   'https://www.khanacademy.org/',                          'article', 1.0),
    ('general',    'MIT OpenCourseWare',             'https://ocw.mit.edu/',                                  'article', 0.5),
    ('general',    'Coursera Free Courses',          'https://www.coursera.org/courses?query=free',           'article', 1.0),
    ('general',    'edX Free Courses',               'https://www.edx.org/search?q=free',                    'article', 1.0),
]

def get_resources(subject: str, topics: list = [], accuracy: float = 0.5, limit: int = 6):
    subject_lower = subject.lower()
    matched = []
    # Match by subject keyword
    for keyword, title, url, rtype, min_acc in CURATED:
        if keyword in subject_lower or subject_lower in keyword or keyword == 'general':
            if accuracy <= min_acc:
                matched.append({'id': title, 'title': title, 'url': url, 'type': rtype,
                                 'subject': subject, 'description': f'Recommended for {subject}'})
    # Deduplicate
    seen = set()
    unique = []
    for r in matched:
        if r['url'] not in seen:
            seen.add(r['url'])
            unique.append(r)
    # If accuracy is low, prioritize remedial resources (general ones come last)
    if accuracy < 0.5:
        unique = sorted(unique, key=lambda x: x['type'] == 'youtube', reverse=True)
    return unique[:limit] if unique else [
        {'id': 'khan', 'title': 'Khan Academy', 'url': 'https://www.khanacademy.org/', 'type': 'article', 'subject': subject, 'description': 'Free learning for any subject'},
        {'id': 'yt',   'title': 'YouTube Educational', 'url': f'https://www.youtube.com/results?search_query={subject}+tutorial', 'type': 'youtube', 'subject': subject, 'description': f'Video tutorials for {subject}'},
    ]

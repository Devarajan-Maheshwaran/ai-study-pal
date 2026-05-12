from __future__ import annotations

# Curated resource database mapped by subject keywords
RESOURCE_DB: dict[str, list[dict]] = {
    "math": [
        {"id": "m1", "title": "Khan Academy - Mathematics", "url": "https://www.khanacademy.org/math", "type": "video", "description": "Free structured math courses from arithmetic to calculus."},
        {"id": "m2", "title": "3Blue1Brown - Essence of Linear Algebra", "url": "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab", "type": "video", "description": "Visual and intuitive linear algebra explanations."},
        {"id": "m3", "title": "MIT OpenCourseWare - Calculus", "url": "https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/", "type": "course", "description": "Full MIT single-variable calculus course."},
        {"id": "m4", "title": "Paul's Online Math Notes", "url": "https://tutorial.math.lamar.edu", "type": "article", "description": "Comprehensive calculus and algebra notes with examples."},
    ],
    "physics": [
        {"id": "p1", "title": "Khan Academy - Physics", "url": "https://www.khanacademy.org/science/physics", "type": "video", "description": "Structured physics courses covering mechanics to electromagnetism."},
        {"id": "p2", "title": "The Feynman Lectures on Physics", "url": "https://www.feynmanlectures.caltech.edu", "type": "article", "description": "Classic physics lectures by Richard Feynman, freely available online."},
        {"id": "p3", "title": "MIT OCW - Physics I", "url": "https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/", "type": "course", "description": "Full MIT classical mechanics course with problem sets."},
    ],
    "chemistry": [
        {"id": "c1", "title": "Khan Academy - Chemistry", "url": "https://www.khanacademy.org/science/chemistry", "type": "video", "description": "Chemistry fundamentals through organic chemistry."},
        {"id": "c2", "title": "Crash Course Chemistry", "url": "https://www.youtube.com/playlist?list=PL8dPuuaLjXtPHzzYuWy6fYEaX9mQQ8oGr", "type": "video", "description": "Fast-paced chemistry overview series."},
    ],
    "biology": [
        {"id": "b1", "title": "Khan Academy - Biology", "url": "https://www.khanacademy.org/science/biology", "type": "video", "description": "Comprehensive biology from cells to ecology."},
        {"id": "b2", "title": "NCBI - Biology Resources", "url": "https://www.ncbi.nlm.nih.gov/books/NBK21054/", "type": "article", "description": "Molecular biology of the cell - free textbook."},
        {"id": "b3", "title": "Crash Course Biology", "url": "https://www.youtube.com/playlist?list=PL3EED4C1D684D3ADF", "type": "video", "description": "Engaging biology overview series."},
    ],
    "computer science": [
        {"id": "cs1", "title": "CS50 - Harvard Introduction to Computer Science", "url": "https://cs50.harvard.edu/x/", "type": "course", "description": "World's most popular intro CS course."},
        {"id": "cs2", "title": "MIT OCW - Introduction to Algorithms", "url": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", "type": "course", "description": "Rigorous algorithm design and analysis."},
        {"id": "cs3", "title": "Neetcode - Data Structures & Algorithms", "url": "https://neetcode.io", "type": "practice", "description": "Structured DSA practice for interviews."},
        {"id": "cs4", "title": "GeeksforGeeks", "url": "https://www.geeksforgeeks.org", "type": "article", "description": "Wide-ranging CS concepts, problems, and explanations."},
    ],
    "history": [
        {"id": "h1", "title": "Crash Course World History", "url": "https://www.youtube.com/playlist?list=PLBDA2E52FB1EF80C9", "type": "video", "description": "Engaging world history overview series."},
        {"id": "h2", "title": "Khan Academy - World History", "url": "https://www.khanacademy.org/humanities/world-history", "type": "video", "description": "Structured world history with timelines."},
    ],
    "economics": [
        {"id": "e1", "title": "Khan Academy - Economics", "url": "https://www.khanacademy.org/economics-finance-domain", "type": "video", "description": "Micro and macroeconomics explained clearly."},
        {"id": "e2", "title": "Crash Course Economics", "url": "https://www.youtube.com/playlist?list=PL8dPuuaLjXtPNZwz5_o_5uirJ8gQXnhEO", "type": "video", "description": "Fast-paced economics fundamentals."},
    ],
    "general": [
        {"id": "g1", "title": "Coursera", "url": "https://www.coursera.org", "type": "course", "description": "University-level courses on any subject."},
        {"id": "g2", "title": "edX", "url": "https://www.edx.org", "type": "course", "description": "Free and paid courses from top universities."},
        {"id": "g3", "title": "Wikipedia", "url": "https://www.wikipedia.org", "type": "article", "description": "Quick reference for any concept."},
        {"id": "g4", "title": "YouTube - Educational", "url": "https://www.youtube.com", "type": "video", "description": "Search for any topic explained visually."},
        {"id": "g5", "title": "Anki - Spaced Repetition Flashcards", "url": "https://apps.ankiweb.net", "type": "tool", "description": "Best-in-class spaced repetition for memorization."},
    ],
}


def get_resources(
    subject: str,
    topics: list[str] = None,
    accuracy: float = 0.5,
) -> list[dict]:
    """
    Return relevant resources for a subject.
    Prioritizes foundational resources when accuracy is low.
    """
    key = subject.lower().strip()
    resources = []

    # Find matching subject category
    for category, items in RESOURCE_DB.items():
        if category in key or key in category:
            resources.extend(items)
            break

    # Always include general resources
    general = RESOURCE_DB.get("general", [])
    existing_ids = {r["id"] for r in resources}
    for r in general:
        if r["id"] not in existing_ids:
            resources.append(r)

    # Sort: if accuracy is low, put courses first; if high, put advanced articles first
    type_priority = ["course", "video", "article", "practice", "tool"]
    if accuracy >= 0.7:
        type_priority = ["article", "practice", "course", "video", "tool"]

    resources.sort(key=lambda r: (
        type_priority.index(r["type"]) if r["type"] in type_priority else 99
    ))

    return resources[:8]

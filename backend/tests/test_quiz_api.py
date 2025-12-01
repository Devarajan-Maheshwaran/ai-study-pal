import requests

BASE_URL = "http://127.0.0.1:5000"

def test_ping():
    resp = requests.get(f"{BASE_URL}/api/ping")
    print("PING status:", resp.status_code)
    print("PING json:", resp.json())

def test_generate_quiz(topic="Python basics", num_questions=3):
    payload = {
        "topic": topic,
        "num_questions": num_questions
    }
    resp = requests.post(f"{BASE_URL}/api/generate-quiz", json=payload)
    print("\nGENERATE QUIZ status:", resp.status_code)
    print("GENERATE QUIZ json:", resp.json())

if __name__ == "__main__":
    print("=== Testing AI Study Pal backend ===")
    test_ping()
    test_generate_quiz()

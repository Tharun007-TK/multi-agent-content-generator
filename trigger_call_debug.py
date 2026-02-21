import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def trigger_call_generation():
    print("Triggering generation for urgent call...")
    payload = {
        "context": "EMERGENCY: Need to reach John Doe at +1-555-0199 immediately. This is life or death. High urgency. Prepare a call script now."
    }
    try:
        response = requests.post(f"{BASE_URL}/content/generate", json=payload)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        return data
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    trigger_call_generation()

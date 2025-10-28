import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_root_redirect():
    """Test that root endpoint redirects to static/index.html"""
    response = client.get("/", follow_redirects=False)
    assert response.status_code == 307  # Temporary redirect
    assert response.headers["location"] == "/static/index.html"

def test_get_activities():
    """Test getting all activities"""
    response = client.get("/activities")
    assert response.status_code == 200
    activities = response.json()
    assert isinstance(activities, dict)
    assert "Chess Club" in activities
    assert "Programming Class" in activities

def test_signup_for_activity():
    """Test signing up for an activity"""
    activity_name = "Chess Club"
    email = "test@mergington.edu"
    
    response = client.post(f"/activities/{activity_name}/signup?email={email}")
    assert response.status_code == 200
    assert response.json() == {"message": f"Signed up {email} for {activity_name}"}
    
    # Verify student was added to participants
    activities_response = client.get("/activities")
    activities = activities_response.json()
    assert email in activities[activity_name]["participants"]

def test_signup_duplicate():
    """Test signing up for an activity when already registered"""
    activity_name = "Chess Club"
    email = "michael@mergington.edu"  # Already registered in this activity
    
    response = client.post(f"/activities/{activity_name}/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]

def test_signup_nonexistent_activity():
    """Test signing up for a non-existent activity"""
    activity_name = "Non Existent Club"
    email = "test@mergington.edu"
    
    response = client.post(f"/activities/{activity_name}/signup?email={email}")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]

def test_unregister_from_activity():
    """Test unregistering from an activity"""
    activity_name = "Chess Club"
    email = "daniel@mergington.edu"  # Using an existing participant
    
    response = client.post(f"/activities/{activity_name}/unregister?email={email}")
    assert response.status_code == 200
    assert response.json() == {"message": f"Unregistered {email} from {activity_name}"}
    
    # Verify student was removed from participants
    activities_response = client.get("/activities")
    activities = activities_response.json()
    assert email not in activities[activity_name]["participants"]

def test_unregister_not_registered():
    """Test unregistering when not registered"""
    activity_name = "Chess Club"
    email = "notregistered@mergington.edu"
    
    response = client.post(f"/activities/{activity_name}/unregister?email={email}")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]

def test_unregister_nonexistent_activity():
    """Test unregistering from a non-existent activity"""
    activity_name = "Non Existent Club"
    email = "test@mergington.edu"
    
    response = client.post(f"/activities/{activity_name}/unregister?email={email}")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]
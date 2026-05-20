from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
print('signup', client.post('/auth/signup', json={'email':'simple@example.com','password':'Testpass123'}).status_code)
print('login', client.post('/auth/login', json={'username':'simple@example.com','password':'Testpass123'}).status_code)
print('tasks', client.get('/tasks').status_code)

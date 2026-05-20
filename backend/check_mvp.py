from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
print('signup', client.post('/auth/signup', json={'email': 'mvp@example.com', 'password': 'Testpass123'}).status_code)
print('login', client.post('/auth/login', json={'username': 'mvp@example.com', 'password': 'Testpass123'}).status_code)
print('create task', client.post('/tasks', json={'title': 'Test task', 'description': 'desc', 'status': 'backlog'}).status_code)
print('get tasks', client.get('/tasks').status_code)

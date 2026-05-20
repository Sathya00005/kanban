import httpx

BASE = 'http://127.0.0.1:8000'

with httpx.Client(timeout=10.0) as client:
    print('signup...')
    r = client.post(BASE + '/auth/signup', json={'name': 'Test User', 'email': 'test.user@example.com', 'password': 'Password123'})
    print('signup', r.status_code, r.text)

    print('login...')
    r = client.post(BASE + '/auth/login', json={'username': 'test.user@example.com', 'password': 'Password123'})
    print('login', r.status_code, r.text)
    if r.status_code != 200:
        raise SystemExit('login failed')
    token = r.json().get('access_token')
    headers = {'Authorization': f'Bearer {token}'}

    print('create task...')
    t = client.post(BASE + '/tasks', json={
        'title': 'Validate Backend',
        'description': 'Test task created through endpoint',
        'status': 'backlog',
        'priority': 'high',
        'assigned_to': [],
    }, headers=headers)
    print('create', t.status_code, t.text)
    if t.status_code != 200:
        raise SystemExit('task create failed')
    task_id = t.json().get('_id')

    print('patch status...')
    p = client.patch(BASE + f'/tasks/{task_id}/status', json={'status': 'wop'}, headers=headers)
    print('patch', p.status_code, p.text)

    print('list tasks...')
    g = client.get(BASE + '/tasks', headers=headers)
    print('tasks', g.status_code, g.text)

    print('create concern...')
    c = client.post(BASE + '/concerns', json={'task_id': task_id, 'manager_id': 'manager123', 'message': 'Need help with deployment'}, headers=headers)
    print('concern', c.status_code, c.text)

import json
import urllib.request
import urllib.error

BASE = 'http://127.0.0.1:8004'
headers = {'Content-Type': 'application/json'}
data = json.dumps({'title': 'drag test', 'description': 'test', 'status': 'backlog'}).encode('utf-8')
req = urllib.request.Request(BASE + '/tasks', data=data, headers=headers, method='POST')
with urllib.request.urlopen(req) as resp:
    print('POST', resp.status)
    print(resp.read().decode())

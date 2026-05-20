import json
import urllib.request
import urllib.error

try:
    data = json.dumps({'title':'ping task','description':'simple','status':'backlog'}).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8004/tasks', data=data, headers={'Content-Type':'application/json'})
    resp = urllib.request.urlopen(req)
    print('post', resp.status, resp.read().decode())
except urllib.error.HTTPError as e:
    print('post err', e.code, e.read().decode())

try:
    req = urllib.request.Request('http://127.0.0.1:8004/tasks', headers={'Content-Type':'application/json'})
    resp = urllib.request.urlopen(req)
    print('get', resp.status, resp.read().decode())
except urllib.error.HTTPError as e:
    print('get err', e.code, e.read().decode())

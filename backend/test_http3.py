import httpx
b='http://127.0.0.1:8000'
print('signup...')
r=httpx.post(b+'/auth/signup',json={'email':'test@local','password':'password'})
print(r.status_code, r.text)
print('login...')
r=httpx.post(b+'/auth/login',json={'username':'test@local','password':'password'})
print(r.status_code, r.text)
if r.status_code==200:
    token=r.json().get('access_token')
    headers={'Authorization':f'Bearer {token}'}
    print('create task...')
    rt=httpx.post(b+'/tasks',json={'title':'Test Task','description':'from script','status':'backlog','priority':'low','assigned_by':None,'assigned_to':[]},headers=headers)
    print(rt.status_code, rt.text)
    g=httpx.get(b+'/tasks',headers=headers)
    print('tasks:', g.status_code, g.text)
else:
    print('login failed')

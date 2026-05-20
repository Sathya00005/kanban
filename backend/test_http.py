import httpx
b='http://127.0.0.1:8000'
print('signup...')
r=httpx.post(b+'/auth/signup',json={'email':'test@local','password':'password'})
print(r.status_code, r.text)
print('login...')
r=httpx.post(b+'/auth/login',json={'username':'test@local','password':'password'})
print(r.status_code, r.text)

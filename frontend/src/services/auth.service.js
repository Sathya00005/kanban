import api from '../api/axios'

export const signup = async (payload) => {
  console.log('SIGNUP PAYLOAD:', payload)
  return api.post('/auth/signup', payload)
}

export const login = async (payload) => {
  console.log('LOGIN PAYLOAD:', payload)
  return api.post('/auth/login', payload)
}

export const me = () => api.get('/auth/me')
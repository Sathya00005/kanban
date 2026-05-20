import api from '../api/axios'

export const getRelationships = () => api.get('/relationships')
export const createRelationship = (payload) => api.post('/relationships', payload)

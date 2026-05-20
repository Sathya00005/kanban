import api from '../api/axios'

export const getConcerns = () => api.get('/concerns')
export const createConcern = (payload) => api.post('/concerns', payload)
export const replyConcern = (id, reply) => api.patch(`/concerns/${id}/reply`, {reply})
export const resolveConcern = (id) => api.patch(`/concerns/${id}/resolve`, {})

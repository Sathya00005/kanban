import create from 'zustand'

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || localStorage.getItem('kanban_token') || null,
  setToken: (t) => {
    localStorage.setItem('token', t)
    localStorage.setItem('kanban_token', t)
    set({ token: t })
  },
  login: (resp) => {
    const token = resp?.data?.access_token || resp?.data?.token
    if (!token) return false
    localStorage.setItem('token', token)
    localStorage.setItem('kanban_token', token)
    set({ token })
    return true
  },
  clear: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('kanban_token')
    set({ token: null })
  }
}))

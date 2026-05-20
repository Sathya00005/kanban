import create from 'zustand'

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  setToken: (t) => {
    localStorage.setItem('token', t)
    set({ token: t })
  },
  clear: () => {
    localStorage.removeItem('token')
    set({ token: null })
  }
}))

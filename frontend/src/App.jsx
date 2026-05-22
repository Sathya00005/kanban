import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import KanbanPage from './pages/KanbanPage'
import { useAuthStore } from './store/auth.store'

function RequireAuth({ children }){
  const token = useAuthStore(s => s.token)
  const persistedToken = token || localStorage.getItem('kanban_token')
  if(!persistedToken) return <Navigate to="/login" />
  return children
}

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/kanban" element={<RequireAuth><KanbanPage/></RequireAuth>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

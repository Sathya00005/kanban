import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../services/auth.service'
import { useAuthStore } from '../store/auth.store'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // 🚀 THE FIX: Declaring the missing route engine hook context!
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()

    try {
      const res = await login({
        username: email.trim().toLowerCase(),
        password
      })

      const token = res?.data?.access_token || res?.data?.token

      if (token) {
        useAuthStore.getState().login(res)
        localStorage.setItem('kanban_token', token)
        localStorage.setItem('user_email', email.trim().toLowerCase())
        
        // 🚀 WILL NOW EXECUTE FLAWLESSLY
        navigate('/kanban')
        return
      }

      throw new Error('No token packet verified.')

    } catch (err) {
      console.error(err)
      const errMsg = err.response?.data?.detail || err.message || "Invalid credentials."
      alert(typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[460px_1fr] bg-slate-950 font-sans text-slate-200 antialiased overflow-hidden">
      {/* Active Form Interface Column */}
      <div className="flex flex-col justify-between p-6 bg-slate-900 border-r border-slate-800/80">
        
        {/* Top Minimal Branding */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
            K
          </div>
          <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Enterprise Core</span>
        </div>

        {/* Dense Form Wrapper */}
        <div className="w-full py-4">
          <div className="mb-5">
            <h1 className="text-xl font-bold tracking-tight text-white">Welcome Back</h1>
            <p className="text-xs text-slate-400 mt-0.5">Re-verify pipeline authority to sync task states</p>
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            <div>
              <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
              <input
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs transition-all text-slate-200 placeholder:text-slate-600"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                type="email"
                placeholder="name@domain.com"
              />
            </div>

            <div>
              <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password Key</label>
              <input
                type="password"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs transition-all text-slate-200 placeholder:text-slate-600"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <button className="w-full mt-1 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] font-semibold text-white py-2 rounded-lg transition-all text-xs tracking-wide shadow-lg shadow-blue-950/50">
              Authenticate Sync
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-800/60 text-center text-xs text-slate-400">
            Need a fresh workspace matrix? 
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 ml-1 font-semibold transition-colors">
              Create Account
            </Link>
          </div>
        </div>

        {/* Lower Micro Footer */}
        <div className="text-[10px] text-slate-600 tracking-tight">
          System version 2.4.0-build // Encrypted TLS Data Pipes
        </div>
      </div>

      {/* High-Density Decorative Dashboard Telemetry Accent Panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 px-3 py-1 rounded-full text-[10px] font-mono text-blue-400 tracking-wider">
            HANDSHAKE VERIFIED // TLS_1.3
          </div>
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800 px-2.5 py-1 rounded-full text-[10px] font-mono text-emerald-400 tracking-wider">
            • SYSTEM OK
          </div>
        </div>

        {/* Illustrative Preview Graphic */}
        <div className="relative z-10 my-auto max-w-2xl mx-auto w-full bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl backdrop-blur-sm shadow-2xl">
          <div className="text-[11px] font-mono text-slate-500 mb-3 tracking-widest uppercase">// INTERFACE PREVIEW</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/40">
              <div className="h-1.5 w-8 bg-slate-700 rounded-full mb-3" />
              <div className="space-y-2">
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                  <div className="h-2 w-16 bg-slate-700 rounded mb-1.5" />
                  <div className="h-1 w-24 bg-slate-800 rounded" />
                </div>
              </div>
            </div>
            <div className="border border-blue-900/30 rounded-xl p-3 bg-slate-950/40 ring-1 ring-blue-500/10">
              <div className="h-1.5 w-12 bg-blue-500/60 rounded-full mb-3" />
              <div className="space-y-2">
                <div className="bg-slate-900 border border-blue-900/40 p-2 rounded-lg">
                  <div className="h-2 w-20 bg-slate-600 rounded mb-1.5" />
                </div>
              </div>
            </div>
            <div className="border border-purple-900/30 rounded-xl p-3 bg-slate-950/40">
              <div className="h-1.5 w-10 bg-purple-500/60 rounded-full mb-3" />
              <div className="space-y-2">
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg opacity-40 line-through">
                  <div className="h-2 w-14 bg-slate-700 rounded mb-1.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="text-blue-500 text-xs font-bold font-mono tracking-widest uppercase mb-1">// REALTIME_WORKSPACE</div>
          <h2 className="text-lg font-bold text-white tracking-tight">Reactive State Orchestration</h2>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Centralized memory caching keeps mutations synchronized instantly across columns. Drag operations write to MongoDB logs transparently behind the scenes.
          </p>
        </div>
      </div>
    </div>
  )
}
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DndContext, closestCenter, useDroppable, useDraggable } from '@dnd-kit/core'
import confetti from 'canvas-confetti' 

import { getTasks, patchStatus, createTask } from '../services/task.service'
import { useTaskStore } from '../store/task.store'
import { useAuthStore } from '../store/auth.store'

const STATUSES = [
  { id: 'backlog', label: 'Backlog', border: 'border-t-slate-500/80', glow: 'shadow-[0_-4px_12px_-4px_rgba(148,163,184,0.2)]', badge: 'bg-slate-900 text-slate-400 border border-slate-800' },
  { id: 'wop', label: 'In Progress', border: 'border-t-blue-500', glow: 'shadow-[0_-4px_12px_-4px_rgba(59,130,246,0.3)]', badge: 'bg-blue-950/40 text-blue-400 border border-blue-900/50' },
  { id: 'debug', label: 'Debugging', border: 'border-t-amber-500', glow: 'shadow-[0_-4px_12px_-4px_rgba(245,158,11,0.3)]', badge: 'bg-amber-950/40 text-amber-400 border border-amber-900/50' },
  { id: 'approved', label: 'Approved', border: 'border-t-emerald-500', glow: 'shadow-[0_-4px_12px_-4px_rgba(16,185,129,0.3)]', badge: 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50' },
  { id: 'deployed', label: 'Deployed', border: 'border-t-purple-500', glow: 'shadow-[0_-4px_12px_-4px_rgba(168,85,247,0.3)]', badge: 'bg-purple-950/40 text-purple-400 border border-purple-900/50' }
]

function Card({ task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task._id })
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50
  } : undefined

  const isDeployed = task.status === 'deployed'

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes} 
      style={style} 
      className={`group p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 shadow-md hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing ${
        isDeployed ? 'bg-slate-900/40 border-slate-800/60 opacity-50' : ''
      } ${isDragging ? 'rotate-2 scale-105 shadow-2xl border-blue-500 ring-1 ring-blue-500/30 bg-slate-900' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`font-medium text-slate-200 text-xs group-hover:text-blue-400 transition-colors tracking-tight ${isDeployed ? 'line-through text-slate-500' : ''}`}>
          {task.title}
        </div>
      </div>
      
      {task.description && (
        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed tracking-tight">
          {task.description}
        </p>
      )}
      
      <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
          task.priority === 'high' ? 'bg-red-950/40 text-red-400 border border-red-900/30' : 'bg-slate-950 text-slate-400 border border-slate-800'
        }`}>
          {task.priority || 'Medium'}
        </span>
        <div className="text-[9px] text-slate-600 font-mono tracking-wider">
          {task._id ? `#${task._id.slice(-4)}` : ''}
        </div>
      </div>
    </div>
  )
}

function Column({ status, label, border, glow, badge, tasks }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  
  return (
    <div 
      ref={setNodeRef} 
      className={`flex flex-col flex-1 min-w-[250px] max-w-sm rounded-xl border-t-2 ${border} ${glow} bg-slate-900/30 border-x border-b border-slate-900 p-3 min-h-[580px] transition-all duration-200 ${
        isOver ? 'bg-slate-900/60 border-blue-900/50 ring-1 ring-blue-500/20' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3.5 px-0.5">
        <h3 className="font-semibold text-slate-300 text-xs tracking-wider uppercase">{label}</h3>
        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${badge}`}>
          {tasks.length}
        </span>
      </div>
      
      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[500px] pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {tasks.map(t => <Card key={t._id} task={t} />)}
        {tasks.length === 0 && (
          <div className="h-20 border border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-[11px] text-slate-600 font-mono tracking-tight italic bg-slate-950/10">
            [ EMPTY_SLOT ]
          </div>
        )}
      </div>
    </div>
  )
}

export default function KanbanPage() {
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  
  const currentUserEmail = useAuthStore(s => s.user?.email || localStorage.getItem("user_email"))
  const tasks = useTaskStore(s => s.tasks)
  const setTasks = useTaskStore(s => s.setTasks)
  const updateTaskLocally = useTaskStore(s => s.updateTaskLocally)
  const logout = useAuthStore(s => s.clear)
  const nav = useNavigate()

  useEffect(() => {
    if (!currentUserEmail) {
      nav('/login')
      return
    }
    
    (async () => {
      try {
        const res = await getTasks()
        const serverTasks = Array.isArray(res.data) ? res.data : []
        const filteredTasks = serverTasks.filter(t => !t.owner_email || t.owner_email === currentUserEmail)
        setTasks(filteredTasks)
      } catch (e) {
        console.error("Failed to load secure task context:", e)
      }
      setLoading(false)
    })()
  }, [setTasks, currentUserEmail, nav])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    try {
      const payload = {
        title: title.trim(), 
        description: description.trim(), 
        status: 'backlog',
        priority: priority,
        owner_email: currentUserEmail
      }
      const res = await createTask(payload)
      const createdTask = {
        ...res.data,
        owner_email: res.data?.owner_email || currentUserEmail
      }
      
      if (createdTask.owner_email === currentUserEmail) {
        setTasks([...tasks, createdTask])
      }
      
      setTitle('')
      setDescription('')
      setPriority('medium')
    } catch (err) {
      console.error(err)
      alert('Unable to create task')
    }
  }

  const triggerConfettiExplosion = () => {
    const duration = 2 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 28, spread: 360, ticks: 60, zIndex: 1000 }

    const randomInRange = (min, max) => Math.random() * (max - min) + min

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 40 * (timeLeft / duration)
      
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)
  }

  const onDragEnd = async (event) => {
    const { active, over } = event
    if (!over) return
    const taskId = active.id
    const destStatus = over.id
    const t = tasks.find(x => x._id === taskId)
    
    if (!t || t.status === destStatus || t.status === 'deployed') return
    if (t.owner_email && t.owner_email !== currentUserEmail) return

    try {
      const res = await patchStatus(taskId, destStatus)
      updateTaskLocally(taskId, { status: res.data.status || destStatus })

      if (destStatus === 'deployed') {
        triggerConfettiExplosion()
      }
    } catch (e) {
      console.error(e)
      alert('Unable to move task')
    }
  }

  const filteredPersonalTasks = tasks.filter(t => !t.owner_email || t.owner_email === currentUserEmail)

  const grouped = STATUSES.reduce((acc, s) => {
    acc[s.id] = filteredPersonalTasks.filter(t => t.status === s.id)
    return acc
  }, {})

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
      <div className="flex flex-col items-center gap-2 font-mono">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-xs text-slate-500 tracking-wider">// RUNTIME_SYNC...</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 antialiased relative">
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

      {/* Top Header Panel */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60 relative">
        <div className="max-w-[1600px] mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-950/50">
              K
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wider uppercase">Telemetry Control</h1>
              <div className="text-[10px] text-slate-500 flex items-center gap-1.5 font-mono">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                {currentUserEmail}
              </div>
            </div>
          </div>
          <button 
            onClick={() => {
              if (logout) logout();
              localStorage.clear();
              sessionStorage.clear();
              nav('/login');
            }} 
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] rounded-lg border border-slate-700/60 transition-all duration-150 tracking-wide uppercase"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Dashboard Canvas Container */}
      <main className="max-w-[1600px] mx-auto px-6 py-6 relative z-10">
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          
          {/* Left Container: Kanban Columns */}
          <div className="w-full xl:flex-1 overflow-x-auto pb-2">
            <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <div className="flex gap-4 min-w-max pb-1">
                {STATUSES.map(s => (
                  <Column 
                    key={s.id} 
                    status={s.id} 
                    label={s.label} 
                    border={s.border} 
                    glow={s.glow} 
                    badge={s.badge} 
                    tasks={grouped[s.id] || []} 
                  />
                ))}
              </div>
            </DndContext>
          </div>
          
          {/* Right Container: Control Form Block */}
          <div className="w-full xl:w-[310px] shrink-0 space-y-4">
            <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl shadow-lg">
              <h2 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3.5">// INSTANTIATE_TASK</h2>
              <form onSubmit={handleCreate} className="space-y-3.5">
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Title</label>
                  <input 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs transition-all text-slate-200 placeholder:text-slate-600" 
                    placeholder="Objective index identifier..." 
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                  <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs transition-all text-slate-200 placeholder:text-slate-600" 
                    rows={2.5} 
                    placeholder="Context parameters..." 
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority Weight</label>
                  <select 
                    value={priority} 
                    onChange={e => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs transition-all text-slate-400 font-medium"
                  >
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="w-full mt-1 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] font-semibold text-white py-2 rounded-lg transition-all text-xs tracking-wide shadow-md shadow-blue-950/40"
                >
                  Append Task Matrix
                </button>
              </form>
            </div>

            {/* Micro Assurances Panel */}
            <div className="bg-slate-900/60 border border-slate-800/60 p-4 rounded-xl text-[11px] space-y-2 font-mono text-slate-500">
              <h4 className="font-bold text-slate-400 tracking-wider uppercase text-[10px] mb-1">// METRIC_POLICIES</h4>
              <div className="flex items-start gap-2 leading-normal">
                <span className="text-blue-500 font-bold">»</span>
                <span>Drag tracking nodes freely horizontally across status gates.</span>
              </div>
              <div className="flex items-start gap-2 leading-normal">
                <span className="text-purple-400 font-bold">»</span>
                <span>Terminated nodes inside <code className="bg-slate-950 px-1 py-0.5 rounded text-purple-400 border border-purple-900/30">deployed</code> seal immutably.</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
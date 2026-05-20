import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DndContext, closestCenter, useDroppable, useDraggable } from '@dnd-kit/core'
import { getTasks, patchStatus, createTask } from '../services/task.service'
import { useTaskStore } from '../store/task.store'
import { useAuthStore } from '../store/auth.store'

const STATUSES = [
  {id:'backlog', label:'Backlog', color:'bg-gray-200'},
  {id:'wop', label:'WOP', color:'bg-blue-200'},
  {id:'debug', label:'Debug', color:'bg-orange-200'},
  {id:'approved', label:'Approved', color:'bg-green-200'},
  {id:'deployed', label:'Deployed', color:'bg-purple-200'}
]

function Card({task}){
  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({id: task._id})
  const style = transform ? {transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`} : undefined

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style} className={`p-3 rounded shadow ${task.status==='deployed' ? 'bg-purple-50 line-through text-slate-500' : ''} ${isDragging?'opacity-80':''}`}>
      <div className="font-semibold">{task.title}</div>
      <div className="text-sm text-gray-600">{task.description}</div>
      <div className="mt-2 text-xs text-slate-500">Priority: {task.priority || 'medium'}</div>
    </div>
  )
}

function Column({status, tasks}){
  const {setNodeRef, isOver} = useDroppable({id: status})
  return (
    <div ref={setNodeRef} className={`flex-1 p-3 rounded border ${isOver? 'bg-blue-50':''}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold capitalize">{status}</h3>
      </div>
      <div className="space-y-3 min-h-[150px]">
        {tasks.map(t => <Card key={t._id} task={t} />)}
      </div>
    </div>
  )
}

export default function KanbanPage(){
  const [loading,setLoading]=useState(true)
  const [title,setTitle]=useState('')
  const [description,setDescription]=useState('')
  const tasks = useTaskStore(s=>s.tasks)
  const setTasks = useTaskStore(s=>s.setTasks)
  const updateTaskLocally = useTaskStore(s=>s.updateTaskLocally)
  const logout = useAuthStore(s=>s.clear)
  const nav = useNavigate()

  useEffect(()=>{
    (async()=>{
      try{
        const res = await getTasks()
        setTasks(res.data)
      }catch(e){
        console.error(e)
      }
      setLoading(false)
    })()
  },[setTasks])

  const handleCreate = async (e)=>{
    e.preventDefault()
    try{
      const payload = {title, description, status: 'backlog'}
      const res = await createTask(payload)
      setTasks([...tasks, res.data])
      setTitle('')
      setDescription('')
    }catch(err){
      console.error(err)
      alert('Unable to create task')
    }
  }

  const onDragEnd = async (event) =>{
    const {active, over} = event
    if(!over) return
    const taskId = active.id
    const destStatus = over.id
    const t = tasks.find(x=>x._id===taskId)
    if(!t || t.status === destStatus || t.status === 'deployed') return
    try{
      const res = await patchStatus(taskId, destStatus)
      updateTaskLocally(taskId, { status: res.data.status || destStatus })
    }catch(e){
      console.error(e)
      alert('Unable to move task')
    }
  }

  const grouped = STATUSES.reduce((acc,s)=>{acc[s.id]=tasks.filter(t=>t.status===s.id);return acc},{})

  if(loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Enterprise Kanban</h1>
            <div className="text-sm text-slate-500">Drag tasks across workflow columns.</div>
          </div>
              <div className="flex items-center gap-3">
            <button onClick={()=>{logout(); nav('/login')}} className="px-3 py-2 bg-red-600 text-white rounded">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <section className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="grid gap-4">
            <div className="bg-white p-5 rounded shadow">
              <h2 className="text-lg font-semibold mb-3">Kanban board</h2>
              <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <div className="grid gap-4 xl:grid-cols-5">
                  {STATUSES.map(s => <Column key={s.id} status={s.id} tasks={grouped[s.id]||[]} />)}
                </div>
              </DndContext>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white p-5 rounded shadow">
              <h2 className="text-lg font-semibold mb-3">Create task</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block mb-2">Title</label>
                  <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block mb-2">Description</label>
                  <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Add task</button>
              </form>
            </div>
            <div className="bg-white p-5 rounded shadow">
              <h2 className="text-lg font-semibold mb-3">Legend</h2>
              <div className="space-y-2 text-sm text-slate-600">
                <div>• Drop tasks into columns to update status.</div>
                <div>• Deployed tasks are immutable and strike-through.</div>
                <div>• Use concerns to raise blockers and ask for guidance.</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { createConcern, getConcerns } from '../services/concern.service'

export default function ConcernsPage(){
  const [taskId, setTaskId] = useState('')
  const [managerId, setManagerId] = useState('')
  const [message, setMessage] = useState('')
  const [concerns, setConcerns] = useState([])

  useEffect(()=>{
    (async()=>{
      try{
        const res=await getConcerns()
        setConcerns(res.data)
      }catch(err){
        console.error(err)
      }
    })()
  },[])

  const submit = async (e) =>{
    e.preventDefault()
    try{
      await createConcern({task_id: taskId, manager_id: managerId, message})
      setMessage('')
      setTaskId('')
      setManagerId('')
      const res = await getConcerns()
      setConcerns(res.data)
    }catch(err){
      alert('Unable to submit concern')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Concern Board</h1>
      <form onSubmit={submit} className="grid gap-4 max-w-xl mb-6">
        <div>
          <label className="block mb-1">Task ID</label>
          <input className="w-full p-2 border rounded" value={taskId} onChange={e=>setTaskId(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Manager ID</label>
          <input className="w-full p-2 border rounded" value={managerId} onChange={e=>setManagerId(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Message</label>
          <textarea className="w-full p-2 border rounded" value={message} onChange={e=>setMessage(e.target.value)} />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Submit concern</button>
      </form>
      <div className="space-y-4">
        {concerns.map(c => (
          <div key={c.id} className="bg-white shadow rounded p-4">
            <div className="text-gray-700"><span className="font-semibold">Task:</span> {c.task_id}</div>
            <div className="text-gray-700"><span className="font-semibold">Manager:</span> {c.manager_id}</div>
            <div className="mt-2">{c.message}</div>
            <div className="mt-2 text-sm text-gray-500">Resolved: {c.resolved ? 'Yes' : 'No'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DndContext, closestCenter, useDroppable, useDraggable } from '@dnd-kit/core'
import confetti from 'canvas-confetti' 

import { getTasks, patchStatus, createTask } from '../services/task.service'
import { useTaskStore } from '../store/task.store'
import { useAuthStore } from '../store/auth.store'

const STATUSES = [
  { id: 'backlog', label: 'Backlog', border: 'border-t-slate-500/80', glow: 'shadow-[0_-4px_12px_-4px_rgba(148,163,184,0.2)]', badge: 'bg-slate-900 text-slate-400 border border-slate-800' },
  { id: 'schedule', label: 'Schedule', border: 'border-t-pink-500', glow: 'shadow-[0_-4px_12px_-4px_rgba(236,72,153,0.3)]', badge: 'bg-pink-950/40 text-pink-400 border border-pink-900/50' },
  { id: 'wop', label: 'Work In Progress', border: 'border-t-blue-500', glow: 'shadow-[0_-4px_12px_-4px_rgba(59,130,246,0.3)]', badge: 'bg-blue-950/40 text-blue-400 border border-blue-900/50' },
  { id: 'debug', label: 'Testing', border: 'border-t-amber-500', glow: 'shadow-[0_-4px_12px_-4px_rgba(245,158,11,0.3)]', badge: 'bg-amber-950/40 text-amber-400 border border-amber-900/50' },
  { id: 'deployed', label: 'Deployed', border: 'border-t-purple-500', glow: 'shadow-[0_-4px_12px_-4px_rgba(168,85,247,0.3)]', badge: 'bg-purple-950/40 text-purple-400 border border-purple-900/50' }
]

function Card({ task, onCardSelect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task._id })
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 100
  } : undefined

  const isDeployed = task.status === 'deployed'

  let cleanDescription = task.description || ""
  let testCases = []
  let estimation = null
  let wopAudit = null
  let qaResults = {}
  let deployLog = null

  // 🛠️ MULTI-TIER SERIALIZATION DESERIALIZER PACK ENGINE
  if (cleanDescription.includes("||")) {
    const segments = cleanDescription.split("||")
    cleanDescription = segments[0].trim()
    try { if (segments[1]) testCases = JSON.parse(segments[1].trim()) } catch (e) { testCases = [] }
    try { if (segments[2]) estimation = JSON.parse(segments[2].trim()) } catch (e) { estimation = null }
    try { if (segments[3]) wopAudit = JSON.parse(segments[3].trim()) } catch (e) { wopAudit = null }
    try { if (segments[4]) qaResults = JSON.parse(segments[4].trim()) } catch (e) { qaResults = {} }
    try { if (segments[5]) deployLog = JSON.parse(segments[5].trim()) } catch (e) { deployLog = null }
  }

  const totalFailures = Object.values(qaResults).filter(r => r.status === 'failure').length

  return (
    <div className="relative group/card">
      <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl shadow-2xl transition-all duration-200 scale-90 opacity-0 pointer-events-none group-hover/card:scale-100 group-hover/card:opacity-100 origin-bottom">
        <div className="text-[10px] font-bold text-slate-500 font-mono tracking-widest uppercase mb-1">// HOVER_INSIGHT</div>
        <p className="text-[11px] text-slate-400 mb-2">{cleanDescription || "No parameters outlined."}</p>
        
        {deployLog && (
          <div className="mb-2 p-1.5 bg-purple-950/40 border border-purple-900/40 rounded text-[10px] font-mono text-purple-400 space-y-0.5">
            <div>🚀 Live: Build <span className="font-bold text-white">{deployLog.versionTag}</span></div>
            <div>🌍 Cluster: <span className="text-slate-200">{deployLog.clusterEnv}</span></div>
            {deployLog.githubRepo && <div className="text-purple-300 truncate">📦 Git Linked</div>}
          </div>
        )}

        {totalFailures > 0 && (
          <div className="mb-2 p-1.5 bg-red-950/40 border border-red-900/40 rounded text-[10px] font-mono text-red-400 font-bold animate-pulse">
            🚨 WARNING: QA CRASH RECORDS ATTACHED
          </div>
        )}
        <div className="text-[9px] text-blue-400 font-mono mt-2 pt-2 border-t border-slate-800/60 animate-pulse">
          ⚡ Click card to lock view onto persistent summary note
        </div>
      </div>

      <div 
        ref={setNodeRef} {...listeners} {...attributes} style={style}
        onClick={() => onCardSelect({ ...task, parsedDesc: cleanDescription, parsedCases: testCases, parsedEst: estimation, parsedWop: wopAudit, parsedQa: qaResults, parsedDeploy: deployLog })}
        className={`group p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 shadow-md hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing hover:ring-1 hover:ring-blue-500/20 ${
          isDeployed ? 'bg-slate-900/40 border-slate-800/60 opacity-60' : ''
        } ${totalFailures > 0 ? 'border-red-900/80 bg-gradient-to-b from-slate-900 via-slate-900 to-red-950/10' : ''} ${isDragging ? 'rotate-2 scale-105 shadow-2xl border-blue-500 ring-1 ring-blue-500/30 bg-slate-900' : ''}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className={`font-medium text-slate-200 text-xs group-hover:text-blue-400 transition-colors tracking-tight ${isDeployed ? 'line-through text-slate-500' : ''}`}>
            {task.title}
          </div>
        </div>
        
        {cleanDescription && (
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 tracking-tight">{cleanDescription}</p>
        )}

        <div className="mt-2 flex flex-wrap gap-1">
          {deployLog && (
            <span className="text-[9px] text-purple-400 font-mono bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-900/50 font-bold animate-bounce">
              🚀 {deployLog.versionTag} Live
            </span>
          )}
          {estimation && !deployLog && (
            <span className="text-[9px] text-pink-400 font-mono bg-pink-950/20 px-1.5 py-0.5 rounded border border-pink-900/30">📅 Scheduled</span>
          )}
          {wopAudit && !deployLog && (
            <span className="text-[9px] text-blue-400 font-mono bg-blue-950/30 px-1.5 py-0.5 rounded border border-blue-900/30">⚙️ WIP</span>
          )}
          {Object.keys(qaResults).length > 0 && !deployLog && (
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${totalFailures > 0 ? 'bg-red-950 text-red-400 border-red-900/50' : 'bg-emerald-950 text-emerald-400 border-emerald-900/50'}`}>
              🧪 QA: {totalFailures > 0 ? `${totalFailures} Fail` : 'Pass'}
            </span>
          )}
        </div>
        
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase ${String(task.priority || 'medium').toLowerCase() === 'high' ? 'bg-red-950/50 text-red-400 border border-red-900/40' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>
            {String(task.priority || 'medium').toLowerCase() === 'high' ? 'High' : 'Medium'}
          </span>
          <div className="text-[9px] text-slate-600 font-mono">
            {task._id ? `#${task._id.slice(-4)}` : ''}
          </div>
        </div>
      </div>
    </div>
  )
}

function Column({ status, label, border, glow, badge, tasks, onCardSelect }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return (
    <div 
      ref={setNodeRef} 
      className={`flex flex-col flex-1 min-w-[240px] max-w-sm rounded-xl border-t-2 ${border} ${glow} bg-slate-900/30 border-x border-b border-slate-900 p-2.5 min-h-[580px] transition-all duration-200 ${
        isOver ? 'bg-slate-900/60 border-blue-900/50 ring-1 ring-blue-500/20' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3.5 px-0.5">
        <h3 className="font-semibold text-slate-300 text-xs tracking-wider uppercase">{label}</h3>
        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${badge}`}>{tasks.length}</span>
      </div>
      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[500px] pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {tasks.map(t => <Card key={t._id} task={t} onCardSelect={onCardSelect} />)}
        {tasks.length === 0 && (
          <div className="h-20 border border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-[11px] text-slate-600 font-mono italic bg-slate-950/10">[ EMPTY_SLOT ]</div>
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
  const [testCasesInput, setTestCasesInput] = useState('')

  const [selectedStickyTask, setSelectedStickyTask] = useState(null)
  
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showWopModal, setShowWopModal] = useState(false)
  const [showQaModal, setShowQaModal] = useState(false)
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [pendingDragEvent, setPendingDragEvent] = useState(null)
  
  // Storage binding hooks
  const [modalDate, setModalDate] = useState('')
  const [modalTime, setModalTime] = useState('')
  const [modalRequiredHours, setModalRequiredHours] = useState('')
  const [wopActualHours, setWopActualHours] = useState('')
  const [wopDelayReason, setWopDelayReason] = useState('')
  const [wopGrievance, setWopGrievance] = useState('')
  const [qaStatuses, setQaStatuses] = useState({})
  const [qaFailLogs, setQaFailLogs] = useState({})

  // RELEASE METRIC VARIABLES STATE
  const [releaseType, setReleaseType] = useState('patch')
  const [envCheck, setEnvCheck] = useState(false)
  const [dbCheck, setDbCheck] = useState(false)
  const [rollbackCheck, setRollbackCheck] = useState(false)
  const [retrospectiveNotes, setRetrospectiveNotes] = useState('')
  const [clusterEnv, setClusterEnv] = useState('Production-US-East')
  const [dbMigrationVer, setDbMigrationVer] = useState('')         
  const [leadEngineer, setLeadEngineer] = useState('')             
  const [riskLevel, setRiskLevel] = useState('low')               
  
  // 🚀 NEW: GITHUB REPOSITORY LINK VARIABLE STATE
  const [githubRepo, setGithubRepo] = useState('')

  const currentUserEmail = useAuthStore(s => s.user?.email || localStorage.getItem("user_email"))
  const tasks = useTaskStore(s => s.tasks)
  const setTasks = useTaskStore(s => s.setTasks)
  const updateTaskLocally = useTaskStore(s => s.updateTaskLocally)
  const logout = useAuthStore(s => s.clear)
  const nav = useNavigate()

  useEffect(() => {
    if (!currentUserEmail) { nav('/login'); return; }
    (async () => {
      try {
        const res = await getTasks()
        const serverTasks = Array.isArray(res.data) ? res.data : []
        const filteredTasks = serverTasks.filter(t => !t.owner_email || t.owner_email === currentUserEmail)
        setTasks(filteredTasks)
      } catch (e) { console.error(e) }
      setLoading(false)
    })()
  }, [setTasks, currentUserEmail, nav])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    try {
      const processedTestCases = testCasesInput.split(",").map(tc => tc.trim()).filter(tc => tc.length > 0)
      const compoundDescriptionStr = `${description.trim()} || ${JSON.stringify(processedTestCases)} || ${JSON.stringify(null)} || ${JSON.stringify(null)} || ${JSON.stringify({})} || ${JSON.stringify(null)}`

      const payload = { title: title.trim(), description: compoundDescriptionStr, status: 'backlog', priority: priority.toLowerCase(), owner_email: currentUserEmail }
      const res = await createTask(payload)
      if (res.data) { setTasks([...tasks, { ...res.data, owner_email: currentUserEmail }]) }
      setTitle(''); setDescription(''); setTestCasesInput('')
    } catch (err) { console.error(err) }
  }

  const triggerConfettiExplosion = () => {
    const duration = 2 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 }
    const randomInRange = (min, max) => Math.random() * (max - min) + min
    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)
      const particleCount = 50 * (timeLeft / duration)
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

    if (destStatus === 'schedule') {
      setPendingDragEvent({ taskId, destStatus, taskObj: t })
      setModalDate(''); setModalTime(''); setModalRequiredHours('')
      setShowScheduleModal(true)
      return
    }
    if (destStatus === 'wop') {
      setPendingDragEvent({ taskId, destStatus, taskObj: t })
      setWopActualHours(''); setWopDelayReason(''); setWopGrievance('')
      setShowWopModal(true)
      return
    }
    if (destStatus === 'debug') {
      let derivedTestCases = []
      if (t.description && t.description.includes("||")) {
        try { derivedTestCases = JSON.parse(t.description.split("||")[1].trim()) } catch(e) { derivedTestCases = [] }
      }
      setPendingDragEvent({ taskId, destStatus, taskObj: t, testCasesList: derivedTestCases })
      setQaStatuses({}); setQaFailLogs({}); setShowQaModal(true)
      return
    }
    if (destStatus === 'deployed') {
      setPendingDragEvent({ taskId, destStatus, taskObj: t })
      setReleaseType('patch'); setEnvCheck(false); setDbCheck(false); setRollbackCheck(false); setRetrospectiveNotes('')
      setClusterEnv('Production-US-East'); setDbMigrationVer(''); setLeadEngineer(''); setRiskLevel('low'); setGithubRepo('')
      setShowDeployModal(true)
      return
    }

    executeStatusUpdate(taskId, destStatus)
  }

  const executeStatusUpdate = async (taskId, destStatus) => {
    try {
      const res = await patchStatus(taskId, destStatus)
      updateTaskLocally(taskId, { status: res.data.status || destStatus })
      if (destStatus === 'deployed') triggerConfettiExplosion()
    } catch (e) { alert('Unable to move task') }
  }

  const getCleanSegments = (descStr) => {
    let arr = [descStr, "[]", "null", "null", "{}", "null"]
    if (descStr.includes("||")) {
      const p = descStr.split("||")
      for(let i=0; i<p.length; i++) arr[i] = p[i].trim()
    }
    return arr
  }

  const submitModalSchedule = async () => {
    if (!modalDate) return alert('Target Date is required.')
    const { taskId, destStatus, taskObj } = pendingDragEvent
    let s = getCleanSegments(taskObj.description)
    const scheduleData = { date: modalDate, time: modalTime, requiredHours: modalRequiredHours.trim() }
    const repackagedDesc = `${s[0]} || ${s[1]} || ${JSON.stringify(scheduleData)} || ${s[3]} || ${s[4]} || ${s[5]}`
    try {
      const res = await patchStatus(taskId, destStatus)
      updateTaskLocally(taskId, { status: res.data.status || destStatus, description: repackagedDesc })
      setTasks(tasks.map(item => item._id === taskId ? { ...item, status: destStatus, description: repackagedDesc } : item))
      setShowScheduleModal(false); setPendingDragEvent(null)
    } catch (e) { console.error(e) }
  }

  const submitWopAuditModal = async () => {
    if (!wopActualHours.trim()) return alert('Please enter actual hours.')
    const { taskId, destStatus, taskObj } = pendingDragEvent
    let s = getCleanSegments(taskObj.description)
    const auditData = { actualHours: wopActualHours.trim(), delayReason: wopDelayReason.trim() || null, grievance: wopGrievance.trim() || null }
    const repackagedDesc = `${s[0]} || ${s[1]} || ${s[2]} || ${JSON.stringify(auditData)} || ${s[4]} || ${s[5]}`
    try {
      const res = await patchStatus(taskId, destStatus)
      updateTaskLocally(taskId, { status: res.data.status || destStatus, description: repackagedDesc })
      setTasks(tasks.map(item => item._id === taskId ? { ...item, status: destStatus, description: repackagedDesc } : item))
      setShowWopModal(false); setPendingDragEvent(null)
    } catch (e) { console.error(e) }
  }

  const submitQaResultsModal = async () => {
    const { taskId, destStatus, taskObj, testCasesList } = pendingDragEvent
    for(let i = 0; i < testCasesList.length; i++) {
      if (!qaStatuses[i]) return alert(`Please evaluate Test Case #${i + 1}.`)
      if (qaStatuses[i] === 'failure' && !qaFailLogs[i]?.trim()) return alert(`Provide feedback details for case #${i + 1}.`)
    }
    let s = getCleanSegments(taskObj.description)
    const qaResultPayload = {}
    testCasesList.forEach((tc, i) => { qaResultPayload[i] = { title: tc, status: qaStatuses[i], failMessage: qaStatuses[i] === 'failure' ? qaFailLogs[i].trim() : null } })
    const repackagedDesc = `${s[0]} || ${s[1]} || ${s[2]} || ${s[3]} || ${JSON.stringify(qaResultPayload)} || ${s[5]}`
    try {
      const res = await patchStatus(taskId, destStatus)
      updateTaskLocally(taskId, { status: res.data.status || destStatus, description: repackagedDesc })
      setTasks(tasks.map(item => item._id === taskId ? { ...item, status: destStatus, description: repackagedDesc } : item))
      setShowQaModal(false); setPendingDragEvent(null)
    } catch (e) { console.error(e) }
  }

  const submitProductionDeploymentModal = async () => {
    if (!envCheck || !dbCheck || !rollbackCheck) {
      return alert('Deployment Halted: Every explicit infrastructure checkbox must be signed off.')
    }
    if (!leadEngineer.trim()) {
      return alert('Deployment Halted: Sign-off requires the Lead Engineer field signature identifier.')
    }
    const { taskId, destStatus, taskObj } = pendingDragEvent

    let major = 1, minor = 0, patch = 0
    const deployedCards = tasks.filter(x => x.status === 'deployed' && x.description?.includes("versionTag"))
    if (deployedCards.length > 0) {
      try {
        const lastCard = deployedCards[deployedCards.length - 1]
        const lastDeployObj = JSON.parse(lastCard.description.split("||")[5].trim())
        const parts = lastDeployObj.versionTag.replace('v', '').split('.').map(Number)
        major = parts[0]; minor = parts[1]; patch = parts[2]
        if (releaseType === 'patch') patch += 1
        else if (releaseType === 'minor') { minor += 1; patch = 0 }
        else if (releaseType === 'major') { major += 1; minor = 0; patch = 0 }
      } catch(e) { patch = deployedCards.length }
    } else {
      if (releaseType === 'patch') patch = 1
      else if (releaseType === 'minor') minor = 1
      else if (releaseType === 'major') major = 2
    }

    const calculatedVersion = `v${major}.${minor}.${patch}`

    // 🚀 INCORPORATED GITHUB REPO DATA VECTOR INTO METADATA OBJECT
    const deployMetadataObj = {
      versionTag: calculatedVersion,
      releaseClassification: releaseType,
      timestamp: new Date().toLocaleDateString(),
      retrospective: retrospectiveNotes.trim() || "Clean production deployment runtime.",
      clusterEnv: clusterEnv,
      dbMigrationVer: dbMigrationVer.trim() || "N/A (No structural migration updates)",
      leadEngineer: leadEngineer.trim(),
      riskLevel: riskLevel,
      githubRepo: githubRepo.trim() || null  // 👈 Stored nicely
    }

    let s = getCleanSegments(taskObj.description)
    const repackagedDesc = `${s[0]} || ${s[1]} || ${s[2]} || ${s[3]} || ${s[4]} || ${JSON.stringify(deployMetadataObj)}`

    try {
      const res = await patchStatus(taskId, destStatus)
      updateTaskLocally(taskId, { status: res.data.status || destStatus, description: repackagedDesc })
      const syncedList = tasks.map(item => item._id === taskId ? { ...item, status: destStatus, description: repackagedDesc } : item)
      setTasks(syncedList)

      if (selectedStickyTask && selectedStickyTask._id === taskId) {
        setSelectedStickyTask({ ...taskObj, status: destStatus, description: repackagedDesc, parsedDesc: s[0], parsedCases: JSON.parse(s[1]), parsedEst: JSON.parse(s[2] === 'null' ? 'null' : s[2]), parsedWop: JSON.parse(s[3] === 'null' ? 'null' : s[3]), parsedQa: JSON.parse(s[4] === '{}' ? '{}' : s[4]), parsedDeploy: deployMetadataObj })
      }

      triggerConfettiExplosion()
      setShowDeployModal(false); setPendingDragEvent(null)
    } catch (e) { console.error(e) }
  }

  const filteredPersonalTasks = tasks.filter(t => !t.owner_email || t.owner_email === currentUserEmail)
  const grouped = STATUSES.reduce((acc, s) => { acc[s.id] = filteredPersonalTasks.filter(t => t.status === s.id); return acc; }, {})

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 antialiased relative">
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="text-[10px] font-mono font-bold tracking-widest text-pink-500 mb-1">// TIMELINE_GATEWAY</div>
            <h3 className="text-sm font-bold text-slate-100 mb-3">Log Operational Duration</h3>
            <div className="space-y-3">
              <input type="date" value={modalDate} onChange={e => setModalDate(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 color-scheme-dark" />
              <input type="time" value={modalTime} onChange={e => setModalTime(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 color-scheme-dark" />
              <textarea value={modalRequiredHours} onChange={e => setModalRequiredHours(e.target.value)} rows={2} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 resize-none" placeholder="Hours needed..." />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowScheduleModal(false) || setPendingDragEvent(null)} className="flex-1 bg-slate-800 text-xs text-slate-300 py-2 rounded-lg">Cancel</button>
              <button onClick={submitModalSchedule} className="flex-1 bg-pink-600 text-xs text-white py-2 rounded-lg">Authorize Log</button>
            </div>
          </div>
        </div>
      )}

      {/* WIP Audit Modal */}
      {showWopModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="text-[10px] font-mono font-bold tracking-widest text-blue-400 mb-1">// WIP_GATEKEEPER_AUDIT</div>
            <h3 className="text-sm font-bold text-slate-100 mb-3">Log Operational Core Metrics</h3>
            <div className="space-y-3">
              <input type="text" value={wopActualHours} onChange={e => setWopActualHours(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs" placeholder="Actual Hours Expended..." />
              <textarea value={wopDelayReason} onChange={e => setWopDelayReason(e.target.value)} rows={2} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs resize-none" placeholder="Delay reason if any..." />
              <textarea value={wopGrievance} onChange={e => setWopGrievance(e.target.value)} rows={2} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs resize-none" placeholder="Blockers or Framework grievances..." />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowWopModal(false) || setPendingDragEvent(null)} className="flex-1 bg-slate-800 text-xs text-slate-300 py-2 rounded-lg">Cancel</button>
              <button onClick={submitWopAuditModal} className="flex-1 bg-blue-600 text-xs text-white py-2 rounded-lg">Commit Metrics</button>
            </div>
          </div>
        </div>
      )}

      {/* QA Results Modal */}
      {showQaModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="text-[10px] font-mono font-bold tracking-widest text-amber-500 mb-1">// QA_REGRESSION_EVALUATOR</div>
            <h3 className="text-sm font-bold text-slate-100 mb-4">Execute Verification Suite</h3>
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {pendingDragEvent?.testCasesList?.map((tc, idx) => (
                <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-850 space-y-2">
                  <div className="text-xs text-slate-300 font-medium">#{idx+1}: {tc}</div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setQaStatuses(p => ({ ...p, [idx]: 'success' }))} className={`flex-1 py-1 rounded text-[10px] font-bold border ${qaStatuses[idx] === 'success' ? 'bg-emerald-950 text-emerald-400 border-emerald-500' : 'bg-slate-900 text-slate-500'}`}>✓ Success</button>
                    <button type="button" onClick={() => setQaStatuses(p => ({ ...p, [idx]: 'failure' }))} className={`flex-1 py-1 rounded text-[10px] font-bold border ${qaStatuses[idx] === 'failure' ? 'bg-red-950 text-red-400 border-red-500' : 'bg-slate-900 text-slate-500'}`}>✗ Failure</button>
                  </div>
                  {qaStatuses[idx] === 'failure' && (
                    <input type="text" value={qaFailLogs[idx] || ''} onChange={e => setQaFailLogs(p => ({ ...p, [idx]: e.target.value }))} className="w-full px-2 py-1 bg-slate-900 border border-red-900 rounded text-xs text-slate-200" placeholder="Crash diagnostic details..." />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4 pt-2 border-t border-slate-800">
              <button onClick={() => setShowQaModal(false) || setPendingDragEvent(null)} className="flex-1 bg-slate-800 text-xs text-slate-300 py-2 rounded-lg">Cancel</button>
              <button onClick={submitQaResultsModal} className="flex-1 bg-amber-600 text-xs text-white py-2 rounded-lg">Log Verification Results</button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTION DEPLOYMENT SAFETIES GATING MODAL */}
      {showDeployModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="text-[10px] font-mono font-bold tracking-widest text-purple-400 mb-1">// HIGH_DENSITY_RELEASE_MATRIX</div>
            <h3 className="text-sm font-bold text-slate-100 mb-3">Authorize Full-Scale Deployment</h3>
            
            <div className="space-y-4 mb-5 text-left">
              <div>
                <label className="block mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">📦 SemVer Metric</label>
                <select value={releaseType} onChange={e => setReleaseType(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300">
                  <option value="patch">Patch Scope (Standard Hotfix Build)</option>
                  <option value="minor">Minor Scope (System Feature Update)</option>
                  <option value="major">Major Scope (Breaking Architecture Core)</option>
                </select>
              </div>

              {/* 🚀 NEW: GITHUB REPOSITORY PASTE BOX FIELD */}
              <div>
                <label className="block mb-1 text-[10px] font-bold text-purple-400 uppercase tracking-widest">🔗 GitHub Repository / Commit URL</label>
                <input 
                  type="url" 
                  value={githubRepo} 
                  onChange={e => setGithubRepo(e.target.value)} 
                  className="w-full px-3 py-1.5 bg-slate-950 border border-purple-900/40 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-slate-700" 
                  placeholder="e.g., https://github.com/user/repo/commit/hash" 
                />
              </div>

              <div>
                <label className="block mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">🌍 Target Infrastructure Cluster</label>
                <select value={clusterEnv} onChange={e => setClusterEnv(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300">
                  <option value="Production-US-East">Production Multi-Zone (US-EAST Cluster)</option>
                  <option value="Production-EU-West">Production Core Hub (EU-WEST Gateway)</option>
                  <option value="Staging-Vanguard-Core">Staging Validation Network (VANGUARD-CORE)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">🗄️ DB Schema Migration Hash</label>
                <input type="text" value={dbMigrationVer} onChange={e => setDbMigrationVer(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200" placeholder="e.g., db_rev_2026_05_A, or leave empty..." />
              </div>

              <div>
                <label className="block mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">✍️ Lead Release Engineer Signature (Required)</label>
                <input type="text" value={leadEngineer} required onChange={e => setLeadEngineer(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 border-dashed border-purple-900/60" placeholder="Type initials or full engineering name..." />
              </div>

              <div>
                <label className="block mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">🚨 Core System Risk Vector Index</label>
                <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)} className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-300">
                  <option value="low">LOW RISK (Standard Pipeline Action)</option>
                  <option value="medium">MEDIUM RISK (Extended Regression Scope Needed)</option>
                  <option value="high">HIGH RISK (Critical Database Impact)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">🛡️ Pipeline Safety Sign-off Checklist</label>
                <div className="space-y-2 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                    <input type="checkbox" checked={envCheck} onChange={e => setEnvCheck(e.target.checked)} className="rounded border-slate-800 text-purple-600 accent-purple-600 w-3.5 h-3.5" />
                    <span>Env Variables Synchronized</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                    <input type="checkbox" checked={dbCheck} onChange={e => setDbCheck(e.target.checked)} className="rounded border-slate-800 text-purple-600 accent-purple-600 w-3.5 h-3.5" />
                    <span>Database Snapshots Executed</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                    <input type="checkbox" checked={rollbackCheck} onChange={e => setRollbackCheck(e.target.checked)} className="rounded border-slate-800 text-purple-600 accent-purple-600 w-3.5 h-3.5" />
                    <span>Rollback Protocols Armed & Safe</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">📝 Field 3: Post-Release Deployment Ledger / Notes</label>
                <textarea value={retrospectiveNotes} onChange={e => setRetrospectiveNotes(e.target.value)} rows={2} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 resize-none" placeholder="Enter post-deploy summaries..." />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowDeployModal(false) || setPendingDragEvent(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 py-2 rounded-lg">Cancel</button>
              <button onClick={submitProductionDeploymentModal} className="flex-1 bg-purple-600 hover:bg-purple-500 text-xs text-white font-bold py-2 rounded-lg shadow-lg">Push To Production</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60 relative">
        <div className="max-w-[1600px] mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">K</div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wider uppercase">Telemetry Control</h1>
              <div className="text-[10px] text-slate-500 flex items-center gap-1.5 font-mono"><span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />{currentUserEmail}</div>
            </div>
          </div>
          <button onClick={() => { if(logout) logout(); localStorage.clear(); sessionStorage.clear(); nav('/login'); }} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] rounded-lg border border-slate-700/60 transition-colors uppercase">Sign Out</button>
        </div>
      </header>

      {/* Grid Canvas */}
      <main className="max-w-[1600px] mx-auto px-4 py-6 relative z-10">
        <div className="flex flex-col xl:flex-row gap-5 items-start">
          
          <div className="w-full xl:flex-1 overflow-x-auto pb-2">
            <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <div className="flex gap-4 min-w-max pb-1">
                {STATUSES.map(s => (
                  <Column key={s.id} status={s.id} label={s.label} border={s.border} glow={s.glow} badge={s.badge} tasks={grouped[s.id] || []} onCardSelect={setSelectedStickyTask} />
                ))}
              </div>
            </DndContext>
          </div>
          
          <div className="w-full xl:w-[310px] shrink-0 space-y-4">
            {/* Global Workspace Amber Sticky Note Notebook component */}
            {selectedStickyTask && (
              <div className="bg-amber-400 text-slate-900 p-4 rounded-xl shadow-2xl relative border border-amber-300 animate-fadeIn">
                <button onClick={() => setSelectedStickyTask(null)} className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center text-slate-700 hover:text-slate-950 font-bold text-xs bg-amber-300/60 rounded-full">✕</button>
                <div className="text-[9px] font-mono font-bold tracking-widest text-amber-900 uppercase mb-1">// SYSTEM_WORKSPACE_STICKY</div>
                <div className="text-[9px] bg-slate-950 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase w-fit mb-2 border border-slate-800">
                  Stage: {STATUSES.find(x => x.id === selectedStickyTask.status)?.label || selectedStickyTask.status}
                </div>
                <h3 className="font-bold text-sm leading-tight text-slate-950 break-words mb-1">{selectedStickyTask.title}</h3>
                <p className="text-xs text-slate-800/90 leading-relaxed mb-3 italic border-b border-amber-500/40 pb-2">"{selectedStickyTask.parsedDesc || 'No summary parameters.'}"</p>
                
                {/* Render Production Release Logs Segment */}
                {selectedStickyTask.parsedDeploy && (
                  <div className="mb-3 text-[11px] font-mono bg-purple-950 text-purple-200 p-3 rounded border border-purple-900 space-y-1.5 shadow-md">
                    <div className="font-black text-white text-[10px] tracking-wider uppercase border-b border-purple-800/50 pb-1 flex items-center justify-between">
                      <span>🚀 LIVE BUILD STAMP</span>
                      <span className="bg-purple-800 text-white px-1.5 rounded text-[9px] font-bold">{selectedStickyTask.parsedDeploy.riskLevel.toUpperCase()} RISK</span>
                    </div>
                    <div>Version Tag: <span className="font-bold text-amber-400">{selectedStickyTask.parsedDeploy.versionTag}</span> <span className="text-[10px] text-purple-300">({selectedStickyTask.parsedDeploy.releaseClassification})</span></div>
                    
                    {/* 🚀 NEW: RENDER CLICKABLE GITHUB EMBED LINK INSIDE RELEASE TELEMETRY BOX */}
                    {selectedStickyTask.parsedDeploy.githubRepo && (
                      <div className="truncate bg-slate-950/40 p-1 rounded border border-purple-900/30">
                        📦 Git Tree: <a href={selectedStickyTask.parsedDeploy.githubRepo} target="_blank" rel="noopener noreferrer" className="text-blue-400 font-bold underline hover:text-blue-300 transition-colors cursor-pointer select-text break-all">{selectedStickyTask.parsedDeploy.githubRepo}</a>
                      </div>
                    )}

                    <div>Target Cluster: <span className="text-white font-medium">{selectedStickyTask.parsedDeploy.clusterEnv}</span></div>
                    <div>Database Revision: <span className="text-slate-300">{selectedStickyTask.parsedDeploy.dbMigrationVer}</span></div>
                    <div>Lead Sign-off: <span className="text-emerald-300 font-bold underline">{selectedStickyTask.parsedDeploy.leadEngineer}</span></div>
                    <div>Release Date: {selectedStickyTask.parsedDeploy.timestamp}</div>
                    <div className="text-[10px] text-slate-300 border-t border-purple-800/40 pt-1.5 mt-1 font-sans italic">Retro Context: "{selectedStickyTask.parsedDeploy.retrospective}"</div>
                  </div>
                )}

                {/* Embedded Schedule Segment */}
                {selectedStickyTask.parsedEst && (
                  <div className="mb-2.5 text-[11px] font-mono bg-amber-500/20 p-2 rounded border border-amber-500/50 text-slate-950">
                    <div className="font-bold uppercase text-[9px] tracking-wide text-amber-950">📅 Schedule Targets:</div>
                    <div>Date Target: {selectedStickyTask.parsedEst.date} @ {selectedStickyTask.parsedEst.time || "00:00"}</div>
                    {selectedStickyTask.parsedEst.requiredHours && <div>Scope: {selectedStickyTask.parsedEst.requiredHours}</div>}
                  </div>
                )}

                {/* Embedded WIP Segment */}
                {selectedStickyTask.parsedWop && (
                  <div className="mb-2.5 text-[11px] font-mono bg-blue-950/10 p-2 rounded border border-amber-500/40 text-slate-950">
                    <div className="font-bold uppercase text-[9px] tracking-wide text-blue-950">⚙️ WIP Metric Audit Log:</div>
                    <div>Expended: {selectedStickyTask.parsedWop.actualHours} hrs</div>
                  </div>
                )}

                {/* Embedded QA Result Matrix Logs */}
                {selectedStickyTask.parsedQa && Object.keys(selectedStickyTask.parsedQa).length > 0 && (
                  <div className="mb-3 text-[11px] font-mono bg-slate-950/10 p-2 rounded border border-amber-500/50 text-slate-950 space-y-1.5">
                    <div className="font-bold uppercase text-[9px] tracking-wide text-amber-950">🧪 Executed QA Diagnostic Trails:</div>
                    {Object.values(selectedStickyTask.parsedQa).map((res, idx) => (
                      <div key={idx} className={`p-1 rounded text-[10px] border ${res.status === 'success' ? 'bg-emerald-500/10 border-emerald-600/20' : 'bg-red-500/10 border-red-600/20 text-red-950'}`}>
                        <div className="font-bold">Case #{idx+1}: {res.status === 'success' ? '✓ Passed' : '✗ Failed'}</div>
                        <div className="text-slate-700">{res.title}</div>
                        {res.failMessage && <div className="p-1 bg-red-950 text-red-400 text-[9px] rounded font-mono mt-0.5">Crash log: {res.failMessage}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Task creation form */}
            <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl shadow-lg">
              <h2 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3.5">// INSTANTIATE_TASK</h2>
              <form onSubmit={handleCreate} className="space-y-3.5">
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none" placeholder="Objective index identifier..." />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none" rows={2} placeholder="Context particulars..." />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Test Cases</label>
                  <input value={testCasesInput} onChange={e => setTestCasesInput(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none" placeholder="TC1, TC2..." />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-slate-400 tracking-widest">Priority Weight</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 font-medium focus:outline-none">
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <button type="submit" className="w-full mt-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs tracking-wide shadow-md">Append Task Matrix</button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
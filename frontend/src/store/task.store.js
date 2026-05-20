import create from 'zustand'

export const useTaskStore = create((set) => ({
  tasks: [],
  setTasks: (t) => set({ tasks: t }),
  updateTaskLocally: (id, changes) => set((s) => ({ tasks: s.tasks.map(t=> t._id===id?{...t,...changes}:t) }))
}))

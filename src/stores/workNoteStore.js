import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { v4 as uuidv4 } from 'uuid'

// Helper functions for task checklist tree
function findTaskInTree(tasks, taskId) {
  if (!tasks) return null
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === taskId) {
      return { parent: null, index: i, task: tasks[i], siblings: tasks }
    }
    if (tasks[i].children && tasks[i].children.length > 0) {
      const found = findTaskInTree(tasks[i].children, taskId)
      if (found) {
        if (found.parent === null) {
          found.parent = tasks[i]
        }
        return found
      }
    }
  }
  return null
}

function countTasksInTree(tasks) {
  let done = 0
  let total = 0
  if (!tasks) return { done, total }
  
  function recurse(list) {
    for (const item of list) {
      total++
      if (item.done) done++
      if (item.children && item.children.length > 0) {
        recurse(item.children)
      }
    }
  }
  recurse(tasks)
  return { done, total }
}

function getTaskDepth(tasks, taskId) {
  const found = findTaskInTree(tasks, taskId)
  if (!found) return -1
  let depth = 0
  let curr = found
  while (curr.parent) {
    depth++
    curr = findTaskInTree(tasks, curr.parent.id)
  }
  return depth
}

export const useWorkNoteStore = defineStore('workNote', {
  state: () => ({
    workspaces: useLocalStorage('wn_workspaces', []),
    projects: useLocalStorage('wn_projects', []),
    modules: useLocalStorage('wn_modules', []),
    submodules: useLocalStorage('wn_submodules', []),
  }),

  getters: {
    getProjectsByWorkspace: (state) => (workspaceId) => {
      return state.projects.filter(p => p.workspaceId === workspaceId)
    },
    getModulesByProject: (state) => (projectId) => {
      return state.modules
        .filter(m => m.projectId === projectId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    },
    getSubmodulesByModule: (state) => (moduleId) => {
      return state.submodules
        .filter(s => s.moduleId === moduleId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    },
    getWorkspaceById: (state) => (id) => {
      return state.workspaces.find(w => w.id === id)
    },
    getProjectById: (state) => (id) => {
      return state.projects.find(p => p.id === id)
    },
    getModuleById: (state) => (id) => {
      return state.modules.find(m => m.id === id)
    },
    getSubmoduleById: (state) => (id) => {
      return state.submodules.find(s => s.id === id)
    },
    getTaskProgress: (state) => (submoduleId) => {
      const submodule = state.submodules.find(s => s.id === submoduleId)
      if (!submodule) return { done: 0, total: 0 }
      return countTasksInTree(submodule.tasks || [])
    }
  },

  actions: {
    // --- WORKSPACE ---
    addWorkspace({ name, contractDuration, position, startContract, endContract }) {
      const workspace = {
        id: uuidv4(),
        name,
        contractDuration: contractDuration || '',
        position: position || '',
        startContract: startContract || '',
        endContract: endContract || '',
        createdAt: new Date().toISOString()
      }
      this.workspaces.push(workspace)
      return workspace
    },
    updateWorkspace(id, updates) {
      const idx = this.workspaces.findIndex(w => w.id === id)
      if (idx !== -1) {
        this.workspaces[idx] = { ...this.workspaces[idx], ...updates }
      }
    },
    deleteWorkspace(id) {
      // Cascade delete projects, modules, and submodules
      const projectsToDelete = this.projects.filter(p => p.workspaceId === id)
      projectsToDelete.forEach(p => this.deleteProject(p.id))
      this.workspaces = this.workspaces.filter(w => w.id !== id)
    },

    // --- PROJECT ---
    addProject({ workspaceId, name, description, startDate, endDate, status }) {
      const project = {
        id: uuidv4(),
        workspaceId,
        name,
        description: description || '',
        startDate: startDate || '',
        endDate: endDate || '',
        status: status || 'belum_mulai',
        createdAt: new Date().toISOString()
      }
      this.projects.push(project)
      return project
    },
    updateProject(id, updates) {
      const idx = this.projects.findIndex(p => p.id === id)
      if (idx !== -1) {
        this.projects[idx] = { ...this.projects[idx], ...updates }
      }
    },
    deleteProject(id) {
      // Cascade delete modules & submodules
      const modulesToDelete = this.modules.filter(m => m.projectId === id)
      modulesToDelete.forEach(m => this.deleteModule(m.id))
      this.projects = this.projects.filter(p => p.id !== id)
    },

    // --- MODULE ---
    addModule({ projectId, name, description, startDate, endDate, status }) {
      const siblingModules = this.modules.filter(m => m.projectId === projectId)
      const nextOrder = siblingModules.length > 0 
        ? Math.max(...siblingModules.map(m => m.order ?? 0)) + 1 
        : 0

      const moduleItem = {
        id: uuidv4(),
        projectId,
        name,
        description: description || '',
        startDate: startDate || '',
        endDate: endDate || '',
        status: status || 'belum_mulai',
        order: nextOrder,
        createdAt: new Date().toISOString()
      }
      this.modules.push(moduleItem)
      return moduleItem
    },
    updateModule(id, updates) {
      const idx = this.modules.findIndex(m => m.id === id)
      if (idx !== -1) {
        this.modules[idx] = { ...this.modules[idx], ...updates }
      }
    },
    deleteModule(id) {
      // Cascade delete submodules
      this.submodules = this.submodules.filter(s => s.moduleId !== id)
      this.modules = this.modules.filter(m => m.id !== id)
    },
    updateModulesOrder(projectId, orderedModuleIds) {
      orderedModuleIds.forEach((id, index) => {
        const idx = this.modules.findIndex(m => m.id === id)
        if (idx !== -1) {
          this.modules[idx].order = index
        }
      })
    },

    // --- SUBMODULE ---
    addSubmodule({ moduleId, name, description, startDate, endDate, status }) {
      const siblingSubmodules = this.submodules.filter(s => s.moduleId === moduleId)
      const nextOrder = siblingSubmodules.length > 0
        ? Math.max(...siblingSubmodules.map(s => s.order ?? 0)) + 1
        : 0

      const submodule = {
        id: uuidv4(),
        moduleId,
        name,
        description: description || '',
        startDate: startDate || '',
        endDate: endDate || '',
        status: status || 'belum_mulai',
        order: nextOrder,
        tasks: [],
        createdAt: new Date().toISOString()
      }
      this.submodules.push(submodule)
      return submodule
    },
    updateSubmodule(id, updates) {
      const idx = this.submodules.findIndex(s => s.id === id)
      if (idx !== -1) {
        this.submodules[idx] = { ...this.submodules[idx], ...updates }
      }
    },
    deleteSubmodule(id) {
      this.submodules = this.submodules.filter(s => s.id !== id)
    },
    updateSubmodulesOrder(moduleId, orderedSubmoduleIds) {
      orderedSubmoduleIds.forEach((id, index) => {
        const idx = this.submodules.findIndex(s => s.id === id)
        if (idx !== -1) {
          this.submodules[idx] = {
            ...this.submodules[idx],
            moduleId,
            order: index
          }
        }
      })
    },

    // --- TASKS ACTIONS ---
    addTask(submoduleId, text, parentId = null) {
      const submodule = this.submodules.find(s => s.id === submoduleId)
      if (!submodule) return null

      if (!submodule.tasks) {
        submodule.tasks = []
      }

      const newTask = {
        id: uuidv4(),
        text,
        done: false,
        createdAt: new Date().toISOString(),
        children: []
      }

      if (!parentId) {
        submodule.tasks.push(newTask)
      } else {
        const parentDepth = getTaskDepth(submodule.tasks, parentId)
        if (parentDepth === -1 || parentDepth >= 2) {
          // Exceeds max 3 levels (depth 0, 1, 2)
          return null
        }
        const found = findTaskInTree(submodule.tasks, parentId)
        if (found) {
          if (!found.task.children) {
            found.task.children = []
          }
          found.task.children.push(newTask)
        }
      }
      return newTask
    },

    toggleTask(submoduleId, taskId) {
      const submodule = this.submodules.find(s => s.id === submoduleId)
      if (!submodule || !submodule.tasks) return

      const found = findTaskInTree(submodule.tasks, taskId)
      if (found) {
        const newDone = !found.task.done
        const now = new Date().toISOString()
        found.task.done = newDone
        found.task.updatedAt = newDone ? now : null
        
        // Recursive helper to set all children to match the parent's check status
        const toggleChildren = (task, doneValue) => {
          if (task.children) {
            task.children.forEach(child => {
              child.done = doneValue
              child.updatedAt = doneValue ? now : null
              toggleChildren(child, doneValue)
            })
          }
        }
        toggleChildren(found.task, newDone)
      }
    },

    deleteTask(submoduleId, taskId) {
      const submodule = this.submodules.find(s => s.id === submoduleId)
      if (!submodule || !submodule.tasks) return

      const found = findTaskInTree(submodule.tasks, taskId)
      if (found) {
        found.siblings.splice(found.index, 1)
      }
    },

    // --- DEMO DATA (Tour Onboarding) ---
    seedDemoData() {
      const DEMO_FLAG_KEY = 'wn_tour_demo_active'
      const DEMO_IDS_KEY = 'wn_tour_demo_ids'

      // Prevent double-seeding
      if (localStorage.getItem(DEMO_FLAG_KEY) === 'true') {
        this.cleanupDemoData()
      }

      const demoWsId = 'demo-ws-001'
      const demoProjId = 'demo-proj-001'
      const demoModId = 'demo-mod-001'
      const demoSubId = 'demo-sub-001'

      const now = new Date().toISOString()
      const startDate = new Date().toISOString().split('T')[0]
      const endDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      // Workspace
      this.workspaces.push({
        id: demoWsId,
        name: '📋 Contoh — PT Abang Express',
        contractDuration: '6 Bulan',
        position: 'Frontend Developer',
        startContract: startDate,
        endContract: endDate,
        createdAt: now,
      })

      // Project
      this.projects.push({
        id: demoProjId,
        workspaceId: demoWsId,
        name: '📂 Contoh — AX Operator Web',
        description: 'Pengembangan dashboard operator untuk sistem logistik Abang Express.',
        startDate,
        endDate,
        status: 'dalam_proses',
        createdAt: now,
      })

      // Module
      this.modules.push({
        id: demoModId,
        projectId: demoProjId,
        name: '📑 Contoh — Dashboard Module',
        description: 'Modul untuk halaman dashboard utama operator.',
        startDate,
        endDate,
        status: 'dalam_proses',
        order: 0,
        createdAt: now,
      })

      // Submodule
      this.submodules.push({
        id: demoSubId,
        moduleId: demoModId,
        name: '✅ Contoh — Slicing Halaman Utama',
        description: 'Slicing halaman dashboard sesuai desain Figma, termasuk sidebar, header, dan widget statistik.',
        startDate,
        endDate,
        status: 'dalam_proses',
        order: 0,
        tasks: [
          {
            id: 'demo-task-001',
            text: 'Setup project structure',
            done: true,
            createdAt: now,
            updatedAt: now,
            children: [
              { id: 'demo-task-004', text: 'Install dependencies', done: true, createdAt: now, updatedAt: now, children: [] },
              { id: 'demo-task-005', text: 'Configure vite', done: true, createdAt: now, updatedAt: now, children: [] }
            ]
          },
          {
            id: 'demo-task-002',
            text: 'Slicing halaman utama',
            done: false,
            createdAt: now,
            children: []
          },
          {
            id: 'demo-task-003',
            text: 'Integrasi API dashboard',
            done: false,
            createdAt: now,
            children: []
          }
        ],
        createdAt: now,
      })

      // Persist demo IDs & flag
      localStorage.setItem(DEMO_IDS_KEY, JSON.stringify({
        workspaceIds: [demoWsId],
        projectIds: [demoProjId],
        moduleIds: [demoModId],
        submoduleIds: [demoSubId],
      }))
      localStorage.setItem(DEMO_FLAG_KEY, 'true')

      return { demoWsId, demoProjId, demoModId, demoSubId }
    },

    cleanupDemoData() {
      const DEMO_FLAG_KEY = 'wn_tour_demo_active'
      const DEMO_IDS_KEY = 'wn_tour_demo_ids'

      const raw = localStorage.getItem(DEMO_IDS_KEY)
      if (!raw) {
        localStorage.removeItem(DEMO_FLAG_KEY)
        return
      }

      try {
        const ids = JSON.parse(raw)

        // Remove in reverse order (submodules → modules → projects → workspaces)
        if (ids.submoduleIds) {
          this.submodules = this.submodules.filter(s => !ids.submoduleIds.includes(s.id))
        }
        if (ids.moduleIds) {
          this.modules = this.modules.filter(m => !ids.moduleIds.includes(m.id))
        }
        if (ids.projectIds) {
          this.projects = this.projects.filter(p => !ids.projectIds.includes(p.id))
        }
        if (ids.workspaceIds) {
          this.workspaces = this.workspaces.filter(w => !ids.workspaceIds.includes(w.id))
        }
      } catch (e) {
        // Fallback: remove anything with demo- prefix
        this.submodules = this.submodules.filter(s => !s.id.startsWith('demo-'))
        this.modules = this.modules.filter(m => !m.id.startsWith('demo-'))
        this.projects = this.projects.filter(p => !p.id.startsWith('demo-'))
        this.workspaces = this.workspaces.filter(w => !w.id.startsWith('demo-'))
      }

      localStorage.removeItem(DEMO_IDS_KEY)
      localStorage.removeItem(DEMO_FLAG_KEY)
    },

    checkAndCleanupStaleDemoData() {
      const DEMO_FLAG_KEY = 'wn_tour_demo_active'
      if (localStorage.getItem(DEMO_FLAG_KEY) === 'true') {
        this.cleanupDemoData()
      }
    },
  }
})

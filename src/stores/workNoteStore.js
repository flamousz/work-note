import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { v4 as uuidv4 } from 'uuid'

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
    }
  },

  actions: {
    // --- WORKSPACE ---
    addWorkspace({ name, contractDuration, position }) {
      const workspace = {
        id: uuidv4(),
        name,
        contractDuration: contractDuration || '',
        position: position || '',
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
    }
  }
})

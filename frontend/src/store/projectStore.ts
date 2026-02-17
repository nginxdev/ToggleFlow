import { create } from 'zustand'
import { projectsApi, environmentsApi } from '@/lib/api'
import type { Project, Environment } from '@/types'

interface ProjectState {
  projects: Project[]
  selectedProject: Project | null
  environments: Environment[]
  selectedEnvironment: Environment | null
  loading: boolean

  fetchProjects: () => Promise<void>
  selectProject: (project: Project) => void
  refreshProjects: () => Promise<void>
  createProject: (data: { name: string; key: string; description?: string }) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  selectEnvironment: (env: Environment) => void
  createEnvironment: (projectId: string, data: { name: string; key: string }) => Promise<void>
  updateEnvironment: (id: string, data: { name?: string; key?: string }) => Promise<void>
  deleteEnvironment: (id: string) => Promise<void>
  fetchEnvironments: (projectId: string) => Promise<void>
}

let projectsFetchPromise: Promise<void> | null = null

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  environments: [],
  selectedEnvironment: null,
  loading: false,

  fetchProjects: async () => {
    if (get().projects.length > 0) return
    if (projectsFetchPromise) return projectsFetchPromise

    projectsFetchPromise = (async () => {
      set({ loading: true })
      try {
        const projects = await projectsApi.getAll()
        set({ projects })

        if (projects.length > 0 && !get().selectedProject) {
          await get().selectProject(projects[0])
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        set({ loading: false })
        projectsFetchPromise = null
      }
    })()

    return projectsFetchPromise
  },

  selectProject: async (project) => {
    set({ selectedProject: project, loading: true })

    try {
      const environments = await environmentsApi.getByProject(project.id)
      set({ environments })

      if (environments.length > 0) {
        set({ selectedEnvironment: environments[0] })
      } else {
        set({ selectedEnvironment: null })
      }
    } catch (error) {
      console.error('Failed to fetch environments for project:', error)
      set({ environments: [], selectedEnvironment: null })
    } finally {
      set({ loading: false })
    }
  },

  refreshProjects: async () => {
    set({ loading: true })
    try {
      const projects = await projectsApi.getAll()
      set({ projects })

      const current = get().selectedProject
      if (current) {
        const freshCurrent = projects.find((p: Project) => p.id === current.id)
        if (freshCurrent) {
          set({ selectedProject: freshCurrent })
        } else {
          set({ selectedProject: projects.length > 0 ? projects[0] : null })
        }
      } else if (projects.length > 0) {
        get().selectProject(projects[0])
      }
    } catch (error) {
      console.error('Failed to refresh projects:', error)
    } finally {
      set({ loading: false })
    }
  },

  createProject: async (data) => {
    await projectsApi.create(data)
    await get().refreshProjects()
  },

  deleteProject: async (id) => {
    await projectsApi.delete(id)
    await get().refreshProjects()
  },

  selectEnvironment: (env) => {
    set({ selectedEnvironment: env })
  },

  createEnvironment: async (projectId, data) => {
    await environmentsApi.create(projectId, data)
    const envs = await environmentsApi.getByProject(projectId)
    set({ environments: envs })
    if (!get().selectedEnvironment && envs.length > 0) {
      set({ selectedEnvironment: envs[0] })
    }
  },

  updateEnvironment: async (id, data) => {
    await environmentsApi.update(id, data)
    const projectId = get().selectedProject?.id
    if (projectId) {
      const envs = await environmentsApi.getByProject(projectId)
      set({ environments: envs })
      const selected = get().selectedEnvironment
      if (selected?.id === id) {
        set({ selectedEnvironment: envs.find((e: Environment) => e.id === id) || selected })
      }
    }
  },

  deleteEnvironment: async (id) => {
    await environmentsApi.delete(id)
    const projectId = get().selectedProject?.id
    if (projectId) {
      const envs = await environmentsApi.getByProject(projectId)
      set({ environments: envs })
      if (get().selectedEnvironment?.id === id) {
        set({ selectedEnvironment: envs.length > 0 ? envs[0] : null })
      }
    }
  },

  fetchEnvironments: async (projectId) => {
    set({ loading: true })
    try {
      const environments = await environmentsApi.getByProject(projectId)
      set({ environments })
    } catch (error) {
      console.error('Failed to fetch environments:', error)
    } finally {
      set({ loading: false })
    }
  },
}))

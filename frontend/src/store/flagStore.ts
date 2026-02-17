import { create } from 'zustand'
import { flagsApi } from '@/lib/api'
import type { FeatureFlag } from '@/types'

interface FlagState {
  flags: FeatureFlag[]
  selectedFlag: FeatureFlag | null
  loading: boolean

  fetchFlags: (projectId: string) => Promise<void>
  fetchFlag: (id: string) => Promise<void>
  createFlag: (projectId: string, data: any) => Promise<void>
  updateFlag: (id: string, data: any) => Promise<void>
  deleteFlag: (id: string) => Promise<void>
  toggleFlag: (id: string, environmentId: string, currentState: boolean) => Promise<void>
}

export const useFlagStore = create<FlagState>((set, get) => ({
  flags: [],
  selectedFlag: null,
  loading: false,

  fetchFlags: async (projectId) => {
    set({ loading: true })
    try {
      const flags = await flagsApi.getByProject(projectId)
      set({ flags })
    } catch (error) {
      console.error('Failed to fetch flags:', error)
      set({ flags: [] })
    } finally {
      set({ loading: false })
    }
  },

  fetchFlag: async (id) => {
    set({ loading: true })
    try {
      const flag = await flagsApi.getOne(id)
      set({ selectedFlag: flag })
    } catch (error) {
      console.error('Failed to fetch flag:', error)
      set({ selectedFlag: null })
    } finally {
      set({ loading: false })
    }
  },

  createFlag: async (projectId, data) => {
    await flagsApi.create(projectId, data)
    await get().fetchFlags(projectId)
  },

  updateFlag: async (id, data) => {
    const updated = await flagsApi.update(id, data)
    set((state) => ({
      flags: state.flags.map((f) => (f.id === id ? { ...f, ...updated } : f)),
      selectedFlag:
        state.selectedFlag?.id === id ? { ...state.selectedFlag, ...updated } : state.selectedFlag,
    }))
  },

  deleteFlag: async (id) => {
    set((state) => ({
      flags: state.flags.filter((f) => f.id !== id),
    }))

    try {
      await flagsApi.delete(id)
    } catch (error) {
      console.error('Delete failed', error)
    }
  },

  toggleFlag: async (flagId, environmentId, currentState) => {
    const updateFlagState = (flag: FeatureFlag) => {
      if (flag.id !== flagId) return flag
      const newEnvs = flag.environments.map((env) => {
        if (env.environmentId !== environmentId) return env
        return { ...env, isEnabled: !currentState }
      })
      return { ...flag, environments: newEnvs }
    }

    set((state) => ({
      flags: state.flags.map(updateFlagState),
      selectedFlag:
        state.selectedFlag?.id === flagId
          ? updateFlagState(state.selectedFlag)
          : state.selectedFlag,
    }))

    try {
      await flagsApi.toggleFlagState(flagId, environmentId, !currentState)
    } catch (error) {
      console.error('Toggle failed', error)
    }
  },
}))

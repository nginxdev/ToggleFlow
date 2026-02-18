import { create } from 'zustand'
import { flagsApi } from '@/lib/api'
import type { FeatureFlag } from '@/types'

interface FlagState {
  flags: FeatureFlag[]
  archivedFlags: FeatureFlag[]
  selectedFlag: FeatureFlag | null
  audits: any[]
  loading: boolean

  fetchFlags: (projectId: string) => Promise<void>
  fetchArchivedFlags: (projectId: string) => Promise<void>
  fetchFlag: (id: string) => Promise<void>
  fetchAudits: (id: string) => Promise<void>
  createFlag: (projectId: string, data: Partial<FeatureFlag>) => Promise<FeatureFlag>
  updateFlag: (id: string, data: Partial<FeatureFlag>) => Promise<void>
  archiveFlag: (id: string) => Promise<void>
  unarchiveFlag: (id: string) => Promise<void>
  deleteFlag: (id: string) => Promise<void>
  toggleFlag: (flagId: string, environmentId: string, currentState: boolean) => Promise<void>
  updateFlagState: (
    flagId: string,
    environmentId: string,
    data: { isEnabled?: boolean; rules?: any },
  ) => Promise<void>
}

export const useFlagStore = create<FlagState>((set, get) => ({
  flags: [],
  archivedFlags: [],
  selectedFlag: null,
  audits: [],
  loading: false,

  fetchFlags: async (projectId) => {
    set({ loading: true })
    try {
      const flags = await flagsApi.getByProject(projectId)
      set({ flags, loading: false })
    } catch (error) {
      console.error('Error fetching flags:', error)
      set({ loading: false })
    }
  },

  fetchArchivedFlags: async (projectId) => {
    set({ loading: true })
    try {
      const archivedFlags = await flagsApi.getArchived(projectId)
      set({ archivedFlags, loading: false })
    } catch (error) {
      console.error('Error fetching archived flags:', error)
      set({ loading: false })
    }
  },

  fetchFlag: async (id) => {
    set({ loading: true })
    try {
      const flag = await flagsApi.getOne(id)
      set({ selectedFlag: flag, loading: false })
    } catch (error) {
      console.error('Failed to fetch flag:', error)
      set({ selectedFlag: null, loading: false })
    }
  },

  fetchAudits: async (id) => {
    try {
      const audits = await flagsApi.getAudits(id)
      set({ audits })
    } catch (error) {
      console.error('Failed to fetch audits:', error)
    }
  },

  createFlag: async (projectId, data) => {
    const newFlag = await flagsApi.create(projectId, data as any)
    await get().fetchFlags(projectId) // Refresh the list of active flags
    return newFlag
  },

  updateFlag: async (id: string, data: Partial<FeatureFlag>) => {
    const updated = await flagsApi.update(id, data as any)
    set((state) => ({
      flags: state.flags.map((f) => (f.id === id ? { ...f, ...updated } : f)),
      archivedFlags: state.archivedFlags.map((f) => (f.id === id ? { ...f, ...updated } : f)),
      selectedFlag:
        state.selectedFlag?.id === id ? { ...state.selectedFlag, ...updated } : state.selectedFlag,
    }))
  },

  archiveFlag: async (id: string) => {
    try {
      await flagsApi.archive(id)
      const { flags, archivedFlags, selectedFlag } = get()
      const flagToArchive = flags.find((f) => f.id === id)

      if (flagToArchive) {
        const archived: FeatureFlag = { ...flagToArchive, isArchived: true }
        set({
          flags: flags.filter((f) => f.id !== id),
          archivedFlags: [...archivedFlags, archived],
          selectedFlag:
            selectedFlag?.id === id ? { ...selectedFlag, isArchived: true } : selectedFlag,
        })
      }
    } catch (error) {
      console.error('Error archiving flag:', error)
      throw error
    }
  },

  unarchiveFlag: async (id: string) => {
    try {
      await flagsApi.unarchive(id)
      const { flags, archivedFlags, selectedFlag } = get()
      const flagToRestore = archivedFlags.find((f) => f.id === id)

      if (flagToRestore) {
        const restored: FeatureFlag = { ...flagToRestore, isArchived: false }
        set({
          archivedFlags: archivedFlags.filter((f) => f.id !== id),
          flags: [...flags, restored],
          selectedFlag:
            selectedFlag?.id === id ? { ...selectedFlag, isArchived: false } : selectedFlag,
        })
      }
    } catch (error) {
      console.error('Error unarchiving flag:', error)
      throw error
    }
  },

  deleteFlag: async (id: string) => {
    try {
      await flagsApi.delete(id)
      const { flags, archivedFlags, selectedFlag } = get()
      set({
        flags: flags.filter((f) => f.id !== id),
        archivedFlags: archivedFlags.filter((f) => f.id !== id),
        selectedFlag: selectedFlag?.id === id ? null : selectedFlag,
      })
    } catch (error) {
      console.error('Error deleting flag:', error)
      throw error
    }
  },

  toggleFlag: async (flagId, environmentId, currentState) => {
    const updateFlagStateList = (flag: FeatureFlag) => {
      if (flag.id !== flagId || !flag.flagStates) return flag
      const newStates = flag.flagStates.map((state) => {
        if (state.environmentId !== environmentId) return state
        return { ...state, isEnabled: !currentState }
      })
      return { ...flag, flagStates: newStates }
    }

    set((state) => ({
      flags: state.flags.map(updateFlagStateList),
      selectedFlag:
        state.selectedFlag?.id === flagId
          ? updateFlagStateList(state.selectedFlag)
          : state.selectedFlag,
    }))

    try {
      await flagsApi.toggleFlagState(flagId, environmentId, !currentState)
    } catch (error) {
      console.error('Toggle failed', error)
      // Revert on error if necessary
    }
  },

  updateFlagState: async (flagId, environmentId, data) => {
    const updated = await flagsApi.updateFlagState(flagId, environmentId, data)

    set((state) => {
      const updateFlagStateList = (flag: FeatureFlag) => {
        if (flag.id !== flagId || !flag.flagStates) return flag
        const newStates = flag.flagStates.map((s) => {
          if (s.environmentId !== environmentId) return s
          return { ...s, ...updated }
        })
        return { ...flag, flagStates: newStates }
      }

      return {
        flags: state.flags.map(updateFlagStateList),
        selectedFlag:
          state.selectedFlag?.id === flagId
            ? updateFlagStateList(state.selectedFlag)
            : state.selectedFlag,
      }
    })
  },
}))

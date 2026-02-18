import { create } from 'zustand'
import { segmentsApi } from '../lib/api'

export interface Segment {
  id: string
  name: string
  key: string
  description?: string
  projectId: string
  rules: {
    attribute: string
    operator: string
    value: string | string[] // Single value or array of values
  }[]
  createdAt: string
  updatedAt: string
}

interface SegmentStore {
  segments: Segment[]
  loading: boolean
  fetchSegments: (projectId: string) => Promise<void>
  createSegment: (projectId: string, data: Partial<Segment>) => Promise<void>
  updateSegment: (id: string, data: Partial<Segment>) => Promise<void>
  deleteSegment: (id: string) => Promise<void>
}

export const useSegmentStore = create<SegmentStore>((set) => ({
  segments: [],
  loading: false,

  fetchSegments: async (projectId: string) => {
    set({ loading: true })
    try {
      const data = await segmentsApi.getAll(projectId)
      set({ segments: data })
    } catch (error) {
      console.error('Failed to fetch segments:', error)
    } finally {
      set({ loading: false })
    }
  },

  createSegment: async (projectId: string, data: Partial<Segment>) => {
    try {
      const newSegment = await segmentsApi.create(projectId, data)
      set((state) => ({ segments: [newSegment, ...state.segments] }))
    } catch (error) {
      console.error('Failed to create segment:', error)
      throw error
    }
  },

  updateSegment: async (id: string, data: Partial<Segment>) => {
    try {
      const updatedSegment = await segmentsApi.update(id, data)
      set((state) => ({
        segments: state.segments.map((s) => (s.id === id ? updatedSegment : s)),
      }))
    } catch (error) {
      console.error('Failed to update segment:', error)
      throw error
    }
  },

  deleteSegment: async (id: string) => {
    try {
      await segmentsApi.delete(id)
      set((state) => ({
        segments: state.segments.filter((s) => s.id !== id),
      }))
    } catch (error) {
      console.error('Failed to delete segment:', error)
      throw error
    }
  },
}))

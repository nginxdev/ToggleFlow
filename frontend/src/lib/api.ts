// API base URL
const API_URL = 'http://localhost:3000/api'

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Projects API
export const projectsApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/projects`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch projects')
    return response.json()
  },

  getOne: async (id: number) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch project')
    return response.json()
  },

  create: async (data: { name: string; key: string; description?: string }) => {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create project')
    return response.json()
  },

  update: async (id: number, data: { name?: string; key?: string; description?: string }) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update project')
    return response.json()
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to delete project')
    return response.json()
  },
}

// Environments API
export const environmentsApi = {
  getByProject: async (projectId: number) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/environments`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch environments')
    return response.json()
  },

  create: async (projectId: number, data: { name: string; key: string }) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/environments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create environment')
    return response.json()
  },

  update: async (id: number, data: { name?: string; key?: string }) => {
    const response = await fetch(`${API_URL}/environments/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update environment')
    return response.json()
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_URL}/environments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to delete environment')
    return response.json()
  },
}

// Flags API
export const flagsApi = {
  getByProject: async (projectId: number) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/flags`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch flags')
    return response.json()
  },

  getOne: async (id: number) => {
    const response = await fetch(`${API_URL}/flags/${id}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch flag')
    return response.json()
  },

  create: async (
    projectId: number,
    data: {
      name: string
      key: string
      description?: string
      type?: string
      defaultValue: string
      variations?: any
    },
  ) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/flags`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create flag')
    return response.json()
  },

  update: async (
    id: number,
    data: {
      name?: string
      key?: string
      description?: string
      type?: string
      defaultValue?: string
      variations?: any
    },
  ) => {
    const response = await fetch(`${API_URL}/flags/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update flag')
    return response.json()
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_URL}/flags/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to delete flag')
    return response.json()
  },

  toggleFlagState: async (flagId: number, environmentId: number, isEnabled: boolean) => {
    const response = await fetch(`${API_URL}/flags/${flagId}/environments/${environmentId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isEnabled }),
    })
    if (!response.ok) throw new Error('Failed to toggle flag')
    return response.json()
  },

  updateFlagState: async (
    flagId: number,
    environmentId: number,
    data: { isEnabled?: boolean; rules?: any },
  ) => {
    const response = await fetch(`${API_URL}/flags/${flagId}/environments/${environmentId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update flag state')
    return response.json()
  },
}

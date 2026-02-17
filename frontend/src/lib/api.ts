// API base URL
const API_URL = 'http://localhost:3000/api'

// Flag to prevent multiple logout toasts
let isLoggingOut = false

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Enhanced fetch wrapper with 401 handling
const apiFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options)

  // Handle 401 Unauthorized
  if (response.status === 401 && !isLoggingOut) {
    isLoggingOut = true

    // Show timeout message
    const event = new CustomEvent('session-timeout', {
      detail: { message: 'Session timed out. Signing out...' },
    })
    window.dispatchEvent(event)

    // Wait 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Clear token
    localStorage.removeItem('token')

    // Redirect to login
    window.location.href = '/login'

    throw new Error('Session expired')
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response
}

// Projects API
export const projectsApi = {
  getAll: async () => {
    const response = await apiFetch(`${API_URL}/projects`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  getOne: async (id: number) => {
    const response = await apiFetch(`${API_URL}/projects/${id}`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  create: async (data: { name: string; key: string; description?: string }) => {
    const response = await apiFetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return response.json()
  },

  update: async (id: number, data: { name?: string; key?: string; description?: string }) => {
    const response = await apiFetch(`${API_URL}/projects/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return response.json()
  },

  delete: async (id: number) => {
    const response = await apiFetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    return response.json()
  },
}

// Environments API
export const environmentsApi = {
  getByProject: async (projectId: number) => {
    const response = await apiFetch(`${API_URL}/projects/${projectId}/environments`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  create: async (projectId: number, data: { name: string; key: string }) => {
    const response = await apiFetch(`${API_URL}/projects/${projectId}/environments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return response.json()
  },

  update: async (id: number, data: { name?: string; key?: string }) => {
    const response = await apiFetch(`${API_URL}/environments/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return response.json()
  },

  delete: async (id: number) => {
    const response = await apiFetch(`${API_URL}/environments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    return response.json()
  },
}

// Flags API
export const flagsApi = {
  getByProject: async (projectId: number) => {
    const response = await apiFetch(`${API_URL}/projects/${projectId}/flags`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  getOne: async (id: number) => {
    const response = await apiFetch(`${API_URL}/flags/${id}`, {
      headers: getAuthHeaders(),
    })
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
    const response = await apiFetch(`${API_URL}/projects/${projectId}/flags`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
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
    const response = await apiFetch(`${API_URL}/flags/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return response.json()
  },

  delete: async (id: number) => {
    const response = await apiFetch(`${API_URL}/flags/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  toggleFlagState: async (flagId: number, environmentId: number, isEnabled: boolean) => {
    const response = await apiFetch(`${API_URL}/flags/${flagId}/environments/${environmentId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isEnabled }),
    })
    return response.json()
  },

  updateFlagState: async (
    flagId: number,
    environmentId: number,
    data: { isEnabled?: boolean; rules?: any },
  ) => {
    const response = await apiFetch(`${API_URL}/flags/${flagId}/environments/${environmentId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return response.json()
  },
}

// Users API
export const usersApi = {
  getProfile: async () => {
    const response = await apiFetch(`${API_URL}/auth/profile`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  updateProfile: async (data: { firstName?: string; lastName?: string; language?: string }) => {
    const response = await apiFetch(`${API_URL}/users/profile`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return response.json()
  },
}

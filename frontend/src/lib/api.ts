const API_URL = 'http://localhost:3000/api'

let isLoggingOut = false

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

const apiFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options)

  if (response.status === 401 && !isLoggingOut) {
    isLoggingOut = true

    const event = new CustomEvent('session-timeout', {
      detail: { message: 'Session timed out. Signing out...' },
    })
    window.dispatchEvent(event)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    localStorage.removeItem('token')
    window.location.href = '/login'

    throw new Error('Session expired')
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response
}

export const projectsApi = {
  getAll: async () => {
    const response = await apiFetch(`${API_URL}/projects`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  getOne: async (id: string) => {
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

  update: async (id: string, data: { name?: string; key?: string; description?: string }) => {
    const response = await apiFetch(`${API_URL}/projects/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return response.json()
  },

  delete: async (id: string) => {
    const response = await apiFetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    return response.json()
  },
}

export const environmentsApi = {
  getByProject: async (projectId: string) => {
    const response = await apiFetch(`${API_URL}/projects/${projectId}/environments`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  create: async (projectId: string, data: { name: string; key: string }) => {
    const response = await apiFetch(`${API_URL}/projects/${projectId}/environments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return response.json()
  },

  update: async (id: string, data: { name?: string; key?: string }) => {
    const response = await apiFetch(`${API_URL}/environments/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return response.json()
  },

  delete: async (id: string) => {
    const response = await apiFetch(`${API_URL}/environments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    })
    return response.json()
  },
}

export const flagsApi = {
  getByProject: async (projectId: string) => {
    const response = await apiFetch(`${API_URL}/projects/${projectId}/flags`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  getOne: async (id: string) => {
    const response = await apiFetch(`${API_URL}/flags/${id}`, {
      headers: getAuthHeaders(),
    })
    return response.json()
  },

  create: async (
    projectId: string,
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
    id: string,
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

  delete: async (id: string) => {
    const response = await apiFetch(`${API_URL}/flags/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    })
    return response.json()
  },

  toggleFlagState: async (flagId: string, environmentId: string, isEnabled: boolean) => {
    const response = await apiFetch(`${API_URL}/flags/${flagId}/environments/${environmentId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isEnabled }),
    })
    return response.json()
  },

  updateFlagState: async (
    flagId: string,
    environmentId: string,
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

export interface Project {
  id: string
  name: string
  key: string
  description?: string
  environments?: Environment[]
  _count?: {
    flags: number
    environments: number
  }
}

export interface Environment {
  id: string
  name: string
  key: string
  apiKey: string
  projectId: string
  requireConfirmation: boolean
}

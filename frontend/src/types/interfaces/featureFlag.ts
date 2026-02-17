export interface FeatureFlag {
  id: string
  name: string
  key: string
  description?: string
  isEnabled: boolean
  type?: string
  flagStates?: Array<{
    id: string
    isEnabled: boolean
    environmentId: string
    environment: {
      id: string
      name: string
      key: string
    }
  }>
  environments: Array<{
    environmentId: string
    isEnabled: boolean
  }>
  project?: {
    id: string
    name: string
    environments?: Array<{
      id: string
      name: string
      key: string
    }>
  }
  variations?: any[]
}

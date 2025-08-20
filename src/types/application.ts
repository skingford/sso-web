export interface Application {
  id: string
  name: string
  description: string
  client_id: string
  client_secret?: string
  redirect_uris: string[]
  scopes: string[]
  status: 'active' | 'inactive' | 'suspended' | 'maintenance'
  type: 'web' | 'mobile' | 'desktop' | 'api'
  owner_id: string
  owner_name: string
  created_at: string
  updated_at: string
  last_used?: string
  usage_count: number
  logo?: string
  website?: string
  homepage_url?: string
  privacy_policy?: string
  terms_of_service?: string
  allowed_scopes?: string[]
  logo_url?: string
}

export interface ApplicationStats {
  total: number
  active: number
  inactive: number
  suspended: number
}
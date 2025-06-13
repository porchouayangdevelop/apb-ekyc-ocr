export type DocumentType = 'national_id' | 'passport' | 'family_book';

export interface ConversionHistoryItem {
  id: string
  fileName: string
  type: DocumentType
  base64: string
  timestamp: string
  fileSize: number
}

export interface DocumentTypeConfig {
  id: DocumentType
  title: string
  icon: string
  color: string
  description: string
}

export interface SnackbarState {
  show: boolean
  message: string
  color: 'success' | 'error' | 'info' | 'warning'
}
// API related types
export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface ValidationResult {
  isValid: boolean
  confidence: number
  documentType: string
  extractedData?: Record<string, any>
  errors?: string[]
}

// Axios module augmentation for global properties
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: import('axios').AxiosInstance
  }
}

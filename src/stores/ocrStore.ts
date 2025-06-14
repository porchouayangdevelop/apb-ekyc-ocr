// src/stores/ocrStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import ApiService from '@/services/api'
import type {
  AuthRequest,
  AuthResponse,
  OcrRequest,
  OcrResponse,
  EncodePasswordResponse
} from '@/services/api'

export interface OcrResult {
  id: string
  documentType: string
  originalImage: string
  processedData: any
  confidence: number
  timestamp: string
  processingTime: number
}

export interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  user: any | null
  encodedPassword: string | null
  publicKey: string | null
}

export const useOcrStore = defineStore('ocr', () => {
  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const authState = ref<AuthState>({
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    user: null,
    encodedPassword: null,
    publicKey: null
  })

  const ocrResults = ref<OcrResult[]>([])
  const currentProcessing = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => authState.value.isAuthenticated)
  const hasResults = computed(() => ocrResults.value.length > 0)
  const latestResult = computed(() => ocrResults.value[0] || null)
  const hasEncodedPassword = computed(() => !!authState.value.encodedPassword)


  // Actions
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  const encodePassword = async (): Promise<void> => {
    try {
      setLoading(true)
      clearError()

      console.log('🔐 Starting password encoding...')

      const response: EncodePasswordResponse = await ApiService.encodePassword()

      // Store encoded password and public key
      authState.value.encodedPassword = response.data.password
      authState.value.publicKey = response.data.publicKey

      console.log('✅ Password encoded successfully')

    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Password encoding failed'
      setError(errorMessage)
      console.error('❌ Password encoding error:', err)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: AuthRequest): Promise<void> => {
    if (!authState.value.encodedPassword) {
      throw new Error('Password must be encoded first. Call encodePassword() before login.')
    }

    try {
      setLoading(true)
      clearError()

      console.log('🚀 Starting login process...')

      // Use encoded password for login
      const loginRequest: AuthRequest = {
        ...credentials,
        password: authState.value.encodedPassword
      }

      const authResponse: AuthResponse = await ApiService.login(loginRequest)

      // Set authenticated state
      authState.value = {
        ...authState.value, // Keep encoded password
        accessToken: authResponse.data.accessToken,
        refreshToken: authResponse.data.refreshToken,
        isAuthenticated: true,
        user: { username: credentials.username }
      }

      // Set token for future API calls
      ApiService.setAuthToken(authResponse.data.accessToken)

      // Store in localStorage for persistence
      localStorage.setItem('auth_token', authResponse.data.accessToken)
      localStorage.setItem('refresh_token', authResponse.data.refreshToken)
      localStorage.setItem('user_data', JSON.stringify({ username: credentials.username }))

      console.log('✅ Login successful')

    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Login failed'
      setError(errorMessage)
      console.error('❌ Login error:', err)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }


  // Authentication
  const authenticate = async (credentials: AuthRequest): Promise<void> => {
    try {
      setLoading(true)
      clearError()

      // Step 1: Encode password if not already encoded
      if (!authState.value.encodedPassword) {
        console.log('🔐 Password not encoded, encoding first...')
        await encodePassword()
      }

      // Step 2: Login with encoded password
      await login(credentials)

      console.log('✅ Full authentication complete')

    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Authentication failed'
      setError(errorMessage)
      console.error('❌ Authentication error:', err)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = () => {
    authState.value = {
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      user: null,
      encodedPassword: null,
      publicKey: null
    }

    ApiService.clearAuthToken()
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')

    // Clear OCR results on logout
    ocrResults.value = []

    console.log('👋 Logged out successfully')
  }

  // Restore authentication from localStorage
  const restoreAuth = () => {
    const token = localStorage.getItem('auth_token')
    const refreshToken = localStorage.getItem('refresh_token')
    const userData = localStorage.getItem('user_data')

    if (token && refreshToken && userData) {
      authState.value = {
        ...authState.value,
        accessToken: token,
        refreshToken: refreshToken,
        isAuthenticated: true,
        user: JSON.parse(userData)
      }

      ApiService.setAuthToken(token)
      console.log('🔄 Authentication restored from storage')
    }
  }

  // OCR Processing
  const processDocument = async (
    base64Image: string,
    documentType: string
  ): Promise<OcrResult> => {
    if (!isAuthenticated.value) {
      throw new Error('Authentication required for OCR processing')
    }

    try {
      setLoading(true)
      clearError()
      currentProcessing.value = `Processing ${documentType}...`

      const startTime = Date.now()

      const ocrRequest: OcrRequest = {
        structure_type: documentType,
        image: base64Image
      }

      const response: OcrResponse = await ApiService.ocrDocumentProcess(ocrRequest)


      const processingTime = Date.now() - startTime

      // Create OCR result
      const ocrResult: OcrResult = {
        id: `ocr_${Date.now()}`,
        documentType,
        originalImage: base64Image,
        processedData: response.data,
        confidence: response.data?.confidence || 0,
        timestamp: new Date().toISOString(),
        processingTime
      }

      // Add to results (newest first)
      ocrResults.value.unshift(ocrResult)

      // Keep only last 50 results
      if (ocrResults.value.length > 50) {
        ocrResults.value = ocrResults.value.slice(0, 50)
      }

      console.log('✅ OCR processing completed:', ocrResult)
      return ocrResult

    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'OCR processing failed'
      setError(errorMessage)
      console.error('❌ OCR processing error:', err)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
      currentProcessing.value = null
    }
  }

  // Batch OCR processing
  const processMultipleDocuments = async (
    documents: Array<{ base64Image: string; documentType: string }>
  ): Promise<OcrResult[]> => {
    const results: OcrResult[] = []

    for (const doc of documents) {
      try {
        const result = await processDocument(doc.base64Image, doc.documentType)
        results.push(result)
      } catch (error) {
        console.error(`Failed to process ${doc.documentType}:`, error)
        // Continue with other documents even if one fails
      }
    }

    return results
  }

  // Clear OCR results
  const clearResults = () => {
    ocrResults.value = []
  }

  // Remove specific result
  const removeResult = (id: string) => {
    const index = ocrResults.value.findIndex(result => result.id === id)
    if (index > -1) {
      ocrResults.value.splice(index, 1)
    }
  }

  // Get result by ID
  const getResultById = (id: string): OcrResult | null => {
    return ocrResults.value.find(result => result.id === id) || null
  }

  // Export results
  const exportResults = (format: 'json' | 'csv' = 'json'): string => {
    if (format === 'json') {
      return JSON.stringify(ocrResults.value, null, 2)
    } else {
      // Simple CSV export
      const headers = ['ID', 'Document Type', 'Confidence', 'Timestamp', 'Processing Time']
      const rows = ocrResults.value.map(result => [
        result.id,
        result.documentType,
        result.confidence,
        result.timestamp,
        result.processingTime
      ])

      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
  }

  // Initialize store (call this in main.ts or app setup)
  const initialize = () => {
    restoreAuth()
  }

  return {
    // State
    isLoading,
    error,
    authState,
    ocrResults,
    currentProcessing,

    // Computed
    isAuthenticated,
    hasResults,
    latestResult,
    hasEncodedPassword,

    // Actions
    setLoading,
    setError,
    clearError,

    // NEW: Separate functions
    encodePassword,
    login,

    // EXISTING: Combined function
    authenticate,

    logout,
    restoreAuth,
    processDocument,
    processMultipleDocuments,
    clearResults,
    removeResult,
    getResultById,
    exportResults,
    initialize
  }
})

export default useOcrStore

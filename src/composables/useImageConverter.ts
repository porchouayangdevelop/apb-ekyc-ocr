

import type { DocumentType, ConversionHistoryItem, DocumentTypeConfig, SnackbarState } from '@/types';

export function useImageConverter() {
  const selectedType= ref<DocumentType | null>(null);
  const selectedFile = ref<File | null>(null);
  const previewUrl = ref<string | null>(null)
  const base64String = ref<string>('')
  const isLoading = ref<boolean>(false)
  const conversionHistory = ref<ConversionHistoryItem[]>([])
  const snackbar = ref<SnackbarState>({
    show: false,
    message: '',
    color: 'success'
  })


  const fileSize = computed(() => {
    if (!selectedFile.value) return ''
    const bytes = selectedFile.value.size
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  })

  const selectDocumentType = (type: DocumentType) => {
    selectedType.value = type
    selectedFile.value = null
    previewUrl.value = null
    base64String.value = ''
    showSnackbar(`Selected ${getDocumentTitle(type)}`, 'info')
  }

  const handleFileSelect = (file: File) => {
    if (!file || !selectedType.value) return

    selectedFile.value = file
    isLoading.value = true

    // Create preview URL
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    previewUrl.value = URL.createObjectURL(file)

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        base64String.value = e.target.result as string;

        // Add to history
        const historyItem: ConversionHistoryItem = {
          id: Date.now().toString(),
          fileName: file.name,
          type: selectedType.value!,
          base64: e.target.result as string,
          timestamp: new Date().toLocaleString(),
          fileSize: file.size
        }

        conversionHistory.value.unshift(historyItem)

        // Keep only last 10 conversions
        if (conversionHistory.value.length > 10) {
          conversionHistory.value = conversionHistory.value.slice(0, 10)
        }

        isLoading.value = false
        showSnackbar('Image converted successfully!', 'success')
      }
    }

    reader.onerror = () => {
      isLoading.value = false
      showSnackbar('Error reading file', 'error')
    }

    reader.readAsDataURL(file)
  }

  const getDocumentIcon = (type: DocumentType): string => {
    const icons = {
      national_id: 'mdi-card-account-details',
      passport: 'mdi-passport',
      family_card: 'mdi-book-account'
    }
    return icons[type]
  }

  const getDocumentTitle = (type: DocumentType): string => {
    const titles = {
      national_id: 'National ID Card',
      passport: 'Passport ID Card',
      family_card: 'Family Book'
    }
    return titles[type]
  }

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      showSnackbar('Base64 string copied to clipboard!', 'success')
    } catch (err) {
      showSnackbar('Failed to copy to clipboard', 'error')
    }
  }

  const downloadBase64 = (filename: string, content: string): void => {
    const element = document.createElement('a')
    const file = new Blob([content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    URL.revokeObjectURL(element.href)
    showSnackbar('Base64 file downloaded!', 'success')
  }

  const showSnackbar = (message: string, color: SnackbarState['color'] = 'success') => {
    snackbar.value = {
      show: true,
      message,
      color
    }
  }

  const clearHistory = () => {
    conversionHistory.value = []
    showSnackbar('History cleared', 'info')
  }

  return {
    // State
    selectedType,
    selectedFile,
    previewUrl,
    base64String,
    isLoading,
    conversionHistory,
    snackbar,
    fileSize,

    // Methods
    selectDocumentType,
    handleFileSelect,
    getDocumentIcon,
    getDocumentTitle,
    copyToClipboard,
    downloadBase64,
    showSnackbar,
    clearHistory
  }
}

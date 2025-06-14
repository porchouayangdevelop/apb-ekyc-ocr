<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary" density="compact" elevation="2">
      <v-app-bar-title>
        <v-icon class="mr-2">mdi-image-text</v-icon>
        OCR Document Processor
      </v-app-bar-title>

      <template v-slot:append>
        <!-- User Menu -->
        <v-menu v-if="ocrStore.isAuthenticated">
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-account-circle" v-bind="props"></v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-list-item-title>{{ userInfo.username }}</v-list-item-title>
              <v-list-item-subtitle>Authenticated</v-list-item-subtitle>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="handleLogout">
              <template v-slot:prepend>
                <v-icon>mdi-logout</v-icon>
              </template>
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-btn v-else icon="mdi-login" @click="$router.push('/login')"></v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <v-container>
        <!-- Header -->
        <v-row>
          <v-col cols="12">
            <v-card class="mb-6" elevation="2">
              <v-card-title class="text-h5 text-center py-6">
                OCR Document Processing System
              </v-card-title>
              <v-card-subtitle class="text-center pb-4">
                Select document type, upload image, and process with AI-powered OCR
              </v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>

        <!-- Authentication Required Message -->
        <v-row v-if="!ocrStore.isAuthenticated">
          <v-col cols="12">
            <v-alert type="warning" variant="tonal" class="mb-6">
              <template #title>Authentication Required</template>
              Please <router-link to="/login" class="text-decoration-underline">login</router-link> to access OCR processing features.
            </v-alert>
          </v-col>
        </v-row>

        <!-- Main Content (only show if authenticated) -->
        <div v-if="ocrStore.isAuthenticated">
          <!-- Step 1: Document Type Selection -->
          <v-row>
            <v-col cols="12">
              <v-card class="mb-6" elevation="2">
                <v-card-title>
                  <v-icon class="mr-2">mdi-numeric-1-circle</v-icon>
                  Step 1: Select Document Type
                </v-card-title>
                <v-card-text>
                  <DocumentSelector
                    :selected-type="selectedType"
                    @select="selectDocumentType"
                  />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Step 2: Image Upload -->
          <v-row v-if="selectedType">
            <v-col cols="12">
              <v-card class="mb-6" elevation="2">
                <v-card-title>
                  <v-icon class="mr-2">mdi-numeric-2-circle</v-icon>
                  Step 2: Upload Document Image
                </v-card-title>
                <v-card-text>
                  <ImageUploader
                    :selected-type="selectedType"
                    :is-loading="isLoading"
                    @file-selected="handleFileSelect"
                  />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Step 3: Preview and Process -->
          <div v-if="previewUrl && base64String">
            <v-row>
              <v-col cols="12">
                <v-card class="mb-6" elevation="2">
                  <v-card-title>
                    <v-icon class="mr-2">mdi-numeric-3-circle</v-icon>
                    Step 3: Preview & Process
                  </v-card-title>
                  <v-card-text>
                    <!-- Image Preview -->
                    <ImagePreview
                      :preview-url="previewUrl"
                      :base64-string="base64String"
                      :selected-type="selectedType"
                      :file-size="fileSize"
                      @copy-to-clipboard="copyToClipboard"
                      @download-base64="downloadBase64"
                    />

                    <!-- OCR Processing Button -->
                    <v-row class="mt-4">
                      <v-col cols="12" class="text-center">
                        <v-btn
                          color="success"
                          size="large"
                          :loading="ocrStore.isLoading"
                          :disabled="!base64String || ocrStore.isLoading"
                          @click="processOcrDocument"
                          class="px-8 py-2"
                        >
                          <v-icon start>mdi-eye-scan</v-icon>
                          {{ ocrStore.isLoading ? 'Processing...' : 'Process with OCR' }}
                        </v-btn>
                      </v-col>
                    </v-row>

                    <!-- OCR Processing Status -->
                    <v-alert
                      v-if="ocrStore.isLoading"
                      type="info"
                      variant="tonal"
                      class="mt-4"
                    >
                      <template #title>Processing Document</template>
                      <div class="d-flex align-center">
                        <v-progress-circular size="20" indeterminate class="mr-2"></v-progress-circular>
                        {{ ocrStore.currentProcessing || 'Extracting data from your document...' }}
                      </div>
                    </v-alert>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Step 4: OCR Results -->
          <DataDetail
            v-if="currentOcrResult"
            :ocr-data="currentOcrResult"
            @retry="retryOcrProcessing"
            @copy-success="showSnackbar"
          />

          <!-- Conversion History -->
          <v-row v-if="conversionHistory.length > 0">
            <v-col cols="12">
              <ConversionHistory
                :conversion-history="conversionHistory"
                @copy-to-clipboard="copyToClipboard"
                @download-base64="downloadBase64"
                @clear-history="clearHistory"
              />
            </v-col>
          </v-row>

          <!-- OCR Results History -->
          <v-row v-if="ocrStore.ocrResults.length > 0">
            <v-col cols="12">
              <v-card elevation="3" class="mt-6">
                <v-card-title class="d-flex align-center justify-space-between">
                  <span>
                    <v-icon class="mr-2">mdi-history</v-icon>
                    OCR Results History ({{ ocrStore.ocrResults.length }})
                  </span>
                  <v-btn
                    color="error"
                    variant="outlined"
                    size="small"
                    @click="ocrStore.clearResults"
                    prepend-icon="mdi-delete"
                  >
                    Clear All
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="ocrHistoryHeaders"
                    :items="ocrStore.ocrResults"
                    item-key="id"
                    class="elevation-1"
                    :items-per-page="5"
                  >
                    <template v-slot:item.documentType="{ item }">
                      <v-chip color="primary" size="small">
                        {{ getDocumentTitle(item.documentType) }}
                      </v-chip>
                    </template>

                    <template v-slot:item.confidence="{ item }">
                      <v-chip
                        :color="getConfidenceColor(item.confidence)"
                        size="small"
                      >
                        {{ item.confidence }}%
                      </v-chip>
                    </template>

                    <template v-slot:item.timestamp="{ item }">
                      {{ formatDate(item.timestamp) }}
                    </template>

                    <template v-slot:item.actions="{ item }">
                      <v-btn
                        icon="mdi-eye"
                        size="small"
                        @click="viewOcrResult(item)"
                        title="View Details"
                      ></v-btn>
                      <v-btn
                        icon="mdi-delete"
                        size="small"
                        color="error"
                        @click="ocrStore.removeResult(item.id)"
                        title="Remove"
                        class="ml-1"
                      ></v-btn>
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-main>

    <!-- Snackbar -->
    <v-snackbar
      :model-value="snackbar.show"
      @update:model-value="updateSnackbar"
      :color="snackbar.color"
      timeout="3000"
      location="bottom right"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="updateSnackbar(false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useImageConverter } from '@/composables/useImageConverter'
import { useOcrStore } from '@/stores/ocrStore'
import type { OcrResult } from '@/stores/ocrStore'
import type { DocumentType } from '@/types'

const router = useRouter()
const ocrStore = useOcrStore()

const {
  selectedType,
  previewUrl,
  base64String,
  isLoading,
  conversionHistory,
  snackbar,
  fileSize,
  selectDocumentType,
  handleFileSelect,
  copyToClipboard,
  downloadBase64,
  clearHistory,
  showSnackbar
} = useImageConverter()

// OCR Results
const currentOcrResult = ref<OcrResult | null>(null)

// Computed
const userInfo = computed(() => ocrStore.authState.user || { username: 'User' })

// OCR History Table Headers
const ocrHistoryHeaders = [
  { title: 'Document Type', key: 'documentType', width: '25%' },
  { title: 'Confidence', key: 'confidence', width: '15%' },
  { title: 'Processing Time', key: 'processingTime', width: '20%' },
  { title: 'Timestamp', key: 'timestamp', width: '25%' },
  { title: 'Actions', key: 'actions', sortable: false, width: '15%' }
]

// Methods
const processOcrDocument = async () => {
  if (!base64String.value || !selectedType.value) {
    showSnackbar('Please select a document type and upload an image first', 'warning')
    return
  }

  try {
    const result = await ocrStore.processDocument(base64String.value, selectedType.value)
    currentOcrResult.value = result
    showSnackbar('OCR processing completed successfully!', 'success')
  } catch (error: any) {
    showSnackbar(error.message || 'OCR processing failed', 'error')
  }
}

const retryOcrProcessing = () => {
  if (base64String.value && selectedType.value) {
    processOcrDocument()
  }
}

const viewOcrResult = (result: OcrResult) => {
  currentOcrResult.value = result
}

const handleLogout = () => {
  ocrStore.logout()
  currentOcrResult.value = null
  showSnackbar('Logged out successfully', 'info')
  router.push('/login')
}

const getDocumentTitle = (type: DocumentType): string => {
  const titles = {
    national_id: 'National ID Card',
    passport: 'Passport ID Card',
    family_book: 'Family Book'
  }
  return titles[type] || type
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 90) return 'success'
  if (confidence >= 70) return 'warning'
  return 'error'
}

const formatDate = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString()
}

const updateSnackbar = (value: boolean) => {
  snackbar.value.show = value
}

// Initialize store and check authentication
onMounted(() => {
  ocrStore.initialize()

  // Redirect to login if not authenticated
  if (!ocrStore.isAuthenticated) {
    router.push('/login')
  }
})
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
}

.v-app-bar-title {
  font-weight: 600;
}
</style>

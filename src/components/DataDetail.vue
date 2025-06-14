<template>
  <v-card v-if="ocrData" elevation="3" class="mt-6">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>
        <v-icon class="mr-2" color="success">mdi-check-circle</v-icon>
        OCR Processing Results
      </span>
      <div class="d-flex gap-2">
        <v-btn
          icon="mdi-download"
          size="small"
          @click="exportData('json')"
          title="Export as JSON"
        ></v-btn>
        <v-btn
          icon="mdi-file-delimited"
          size="small"
          @click="exportData('csv')"
          title="Export as CSV"
        ></v-btn>
        <v-btn
          icon="mdi-refresh"
          size="small"
          @click="$emit('retry')"
          title="Process Again"
        ></v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <!-- Processing Summary -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-chip color="primary" size="large" block>
            <v-icon start>{{ getDocumentIcon(ocrData.documentType) }}</v-icon>
            {{ getDocumentTitle(ocrData.documentType) }}
          </v-chip>
        </v-col>
        <v-col cols="12" md="3">
          <v-chip :color="getConfidenceColor(ocrData.confidence)" size="large" block>
            <v-icon start>mdi-percent</v-icon>
            {{ ocrData.confidence }}% Confidence
          </v-chip>
        </v-col>
        <v-col cols="12" md="3">
          <v-chip color="info" size="large" block>
            <v-icon start>mdi-clock</v-icon>
            {{ ocrData.processingTime }}ms
          </v-chip>
        </v-col>
        <v-col cols="12" md="3">
          <v-chip color="secondary" size="large" block>
            <v-icon start>mdi-calendar</v-icon>
            {{ formatDate(ocrData.timestamp) }}
          </v-chip>
        </v-col>
      </v-row>

      <!-- Data Table -->
      <v-data-table
        :headers="tableHeaders"
        :items="tableItems"
        item-key="field"
        class="elevation-1"
        :items-per-page="10"
        :search="searchText"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Extracted Data</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="searchText"
              append-icon="mdi-magnify"
              label="Search fields..."
              single-line
              hide-details
              variant="outlined"
              density="compact"
              style="max-width: 300px;"
            ></v-text-field>
          </v-toolbar>
        </template>

        <template v-slot:item.field="{ item }">
          <strong>{{ item.field }}</strong>
        </template>

        <template v-slot:item.value="{ item }">
          <div class="text-body-2">
            <span v-if="item.value !== null && item.value !== undefined">
              {{ formatValue(item.value) }}
            </span>
            <v-chip v-else size="small" color="grey" variant="outlined">
              No Data
            </v-chip>
          </div>
        </template>

        <template v-slot:item.confidence="{ item }">
          <v-chip
            v-if="item.confidence !== null"
            :color="getConfidenceColor(item.confidence)"
            size="small"
          >
            {{ item.confidence }}%
          </v-chip>
          <span v-else class="text-grey">-</span>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon="mdi-content-copy"
            size="small"
            @click="copyValue(item.value)"
            :disabled="!item.value"
            title="Copy value"
          ></v-btn>
        </template>
      </v-data-table>

      <!-- Raw Data Section -->
      <v-expansion-panels class="mt-6">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="mr-2">mdi-code-json</v-icon>
            Raw OCR Response
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-card variant="flat">
              <v-card-text>
                <pre class="text-body-2 bg-grey-darken-4">{{ JSON.stringify(ocrData.processedData, null, 2) }}</pre>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  prepend-icon="mdi-content-copy"
                  @click="copyRawData"
                  size="small"
                >
                  Copy Raw Data
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { OcrResult } from '@/stores/ocrStore'
import type { DocumentType } from '@/types'

interface Props {
  ocrData: OcrResult | null
}

interface Emits {
  (e: 'retry'): void
  (e: 'copy-success', message: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchText = ref('')

// Table headers
const tableHeaders = [
  { title: 'Field', key: 'field', width: '25%' },
  { title: 'Value', key: 'value', width: '45%' },
  { title: 'Confidence', key: 'confidence', width: '15%' },
  { title: 'Actions', key: 'actions', sortable: false, width: '15%' }
]

// Computed table items from OCR data
const tableItems = computed(() => {
  if (!props.ocrData?.processedData) return []

  const flattenObject = (obj: any, prefix = ''): any[] => {
    const items: any[] = []

    for (const [key, value] of Object.entries(obj)) {
      const fieldName = prefix ? `${prefix}.${key}` : key

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // If it's a nested object, recursively flatten it
        items.push(...flattenObject(value, fieldName))
      } else {
        items.push({
          field: fieldName,
          value: value,
          confidence: typeof value === 'object' && value?.confidence || null
        })
      }
    }

    return items
  }

  return flattenObject(props.ocrData.processedData)
})

// Methods
const getDocumentIcon = (type: DocumentType): string => {
  const icons = {
    national_id: 'mdi-card-account-details',
    passport: 'mdi-passport',
    family_book: 'mdi-book-account'
  }
  return icons[type] || 'mdi-file-document'
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

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const copyValue = async (value: any) => {
  try {
    const textToCopy = formatValue(value)
    await navigator.clipboard.writeText(textToCopy)
    emit('copy-success', 'Value copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy value:', error)
  }
}

const copyRawData = async () => {
  try {
    const jsonData = JSON.stringify(props.ocrData?.processedData, null, 2)
    await navigator.clipboard.writeText(jsonData)
    emit('copy-success', 'Raw data copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy raw data:', error)
  }
}

const exportData = (format: 'json' | 'csv') => {
  if (!props.ocrData) return

  let content = ''
  let filename = ''
  let mimeType = ''

  if (format === 'json') {
    content = JSON.stringify(props.ocrData.processedData, null, 2)
    filename = `ocr-${props.ocrData.documentType}-${Date.now()}.json`
    mimeType = 'application/json'
  } else {
    const headers = ['Field', 'Value', 'Confidence']
    const rows = tableItems.value.map(item => [
      item.field,
      formatValue(item.value),
      item.confidence || ''
    ])
    content = [headers, ...rows].map(row => row.join(',')).join('\n')
    filename = `ocr-${props.ocrData.documentType}-${Date.now()}.csv`
    mimeType = 'text/csv'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  emit('copy-success', `Data exported as ${format.toUpperCase()}!`)
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

pre {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 400px;
  font-size: 12px;
}
</style>

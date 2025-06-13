<template>
  <v-card elevation="3" v-if="conversionHistory.length > 0">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>
        <v-icon class="mr-2">mdi-history</v-icon>
        Conversion History ({{ conversionHistory.length }})
      </span>
      <v-btn
        color="error"
        variant="outlined"
        size="small"
        @click="clearHistory"
        prepend-icon="mdi-delete"
      >
        Clear
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item
          v-for="item in conversionHistory"
          :key="item.id"
          class="mb-2"
        >
          <template v-slot:prepend>
            <v-avatar color="primary" size="40">
              <v-icon>{{ getDocumentIcon(item.type) }}</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title>{{ item.fileName }}</v-list-item-title>
          <v-list-item-subtitle>
            <div class="d-flex align-center gap-2 mt-1">
              <v-chip size="x-small" color="primary" variant="tonal">
                {{ getDocumentTitle(item.type) }}
              </v-chip>
              <v-chip size="x-small" color="secondary" variant="tonal">
                {{ formatFileSize(item.fileSize) }}
              </v-chip>
              <span class="text-caption">{{ item.timestamp }}</span>
            </div>
          </v-list-item-subtitle>

          <template v-slot:append>
            <div class="d-flex gap-1">
              <v-btn
                icon="mdi-content-copy"
                size="small"
                variant="text"
                @click="copyHistoryItem(item)"
                title="Copy base64"
              ></v-btn>
              <v-btn
                icon="mdi-download"
                size="small"
                variant="text"
                @click="downloadHistoryItem(item)"
                title="Download base64"
              ></v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { ConversionHistoryItem, DocumentType } from '@/types'

interface Props {
  conversionHistory: ConversionHistoryItem[]
}

interface Emits {
  (e: 'copy-to-clipboard', text: string): void
  (e: 'download-base64', filename: string, content: string): void
  (e: 'clear-history'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const getDocumentIcon = (type: DocumentType): string => {
  const icons = {
    national_id: 'mdi-card-account-details',
    passport: 'mdi-passport',
    family_book: 'mdi-book-account'
  }
  return icons[type]
}

const getDocumentTitle = (type: DocumentType): string => {
  const titles = {
    national_id: 'National ID Card',
    passport: 'Passport ID Card',
    family_book: 'Family Book'
  }
  return titles[type]
}

const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const copyHistoryItem = (item: ConversionHistoryItem) => {
  emit('copy-to-clipboard', item.base64)
}

const downloadHistoryItem = (item: ConversionHistoryItem) => {
  const filename = `${item.type}_${item.fileName.split('.')[0]}_base64.txt`
  emit('download-base64', filename, item.base64)
}

const clearHistory = () => {
  emit('clear-history')
}
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}
</style>

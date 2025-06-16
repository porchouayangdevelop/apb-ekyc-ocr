<template>
  <v-card elevation="3" v-if="selectedType">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">{{ getDocumentIcon(selectedType) }}</v-icon>
      {{ getDocumentTitle(selectedType) }}
    </v-card-title>
    <v-card-text>
      <v-file-input
        v-model="fileInput"
        accept="image/*"
        label="Choose image file"
        prepend-icon="mdi-camera"
        show-size
        @change="handleFileChange"
        :loading="isLoading"
        clearable
      ></v-file-input>

      <v-alert
        v-if="selectedType"
        type="info"
        variant="tonal"
        class="mt-4"
      >
        <template #title>Accepted formats</template>
        JPG, PNG, GIF, BMP, WebP (Max 10MB)
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { DocumentType } from '@/types'

interface Props {
  selectedType: DocumentType | null
  isLoading: boolean
}

interface Emits {
  (e: 'file-selected', file: File): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const fileInput = ref<File[]>([])

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || fileInput.value[0]

  if (file) {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      fileInput.value = []
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      fileInput.value = []
      return
    }

    emit('file-selected', file)
  }
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

// Clear file input when document type changes
watch(() => props.selectedType, () => {
  fileInput.value = []
})
</script>

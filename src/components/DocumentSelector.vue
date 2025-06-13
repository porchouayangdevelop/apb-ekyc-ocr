<template>
  <v-row>
    <v-col cols="12" md="4" v-for="config in documentTypes" :key="config.id">
      <v-card
        class="document-card"
        elevation="3"
        :class="{ 'border-primary': selectedType === config.id }"
        @click="selectDocumentType(config.id)"
        hover
      >
        <v-card-text class="text-center">
          <v-icon size="64" :color="config.color" class="mb-4">
            {{ config.icon }}
          </v-icon>
          <h3 class="text-h6 mb-3">{{ config.title }}</h3>
          <p class="text-body-2 mb-4">{{ config.description }}</p>
          <v-btn
            :color="config.color"
            :variant="selectedType === config.id ? 'flat' : 'outlined'"
          >
            {{ selectedType === config.id ? 'Selected' : 'Select' }}
          </v-btn>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { DocumentType, DocumentTypeConfig } from '@/types'

interface Props {
  selectedType: DocumentType | null
}

interface Emits {
  (e: 'select', type: DocumentType): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const documentTypes: DocumentTypeConfig[] = [
  {
    id: 'national_id',
    title: 'National ID Card',
    icon: 'mdi-card-account-details',
    color: 'primary',
    description: 'Upload your national identification card'
  },
  {
    id: 'passport',
    title: 'Passport ID Card',
    icon: 'mdi-passport',
    color: 'success',
    description: 'Upload your passport identification'
  },
  {
    id: 'family_book',
    title: 'Family Book',
    icon: 'mdi-book-account',
    color: 'orange',
    description: 'Upload your family registration book'
  }
]

const selectDocumentType = (type: DocumentType) => {
  emit('select', type)
}
</script>

<style scoped>
.document-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
}

.border-primary {
  border: 2px solid rgb(var(--v-theme-primary));
}
</style>

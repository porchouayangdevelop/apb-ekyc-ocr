<template>
  <v-row v-if="previewUrl">
    <v-col cols="12" md="6">
      <v-card elevation="3">
        <v-card-title>
          <v-icon class="mr-2">mdi-image</v-icon>
          Image Preview
        </v-card-title>
        <v-card-text class="text-center">
          <img
            :src="previewUrl"
            class="preview-image"
            alt="Document preview"
            @load="onImageLoad"
            @error="onImageError"
          />
          <div class="mt-4 d-flex justify-center gap-2">
            <v-chip color="primary">
              {{ selectedType?.replace('_', ' ').toUpperCase() }}
            </v-chip>
            <v-chip color="secondary">
              {{ fileSize }}
            </v-chip>
            <v-chip color="info" v-if="imageDimensions">
              {{ imageDimensions }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card elevation="3">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>
            <v-icon class="mr-2">mdi-code-string</v-icon>
            Base64 Output
          </span>
          <div class="d-flex gap-2">
            <v-btn
              icon="mdi-content-copy"
              size="small"
              @click="copyToClipboard"
              :disabled="!base64String"
              title="Copy to clipboard"
            ></v-btn>
            <v-btn
              icon="mdi-download"
              size="small"
              @click="downloadBase64"
              :disabled="!base64String"
              title="Download as file"
            ></v-btn>
          </div>
        </v-card-title>
        <v-card-text>
          <v-textarea
            :model-value="base64String"
            readonly
            class="base64-output"
            rows="8"
            variant="outlined"
            placeholder="Base64 string will appear here..."
          ></v-textarea>
          <div class="d-flex justify-space-between mt-2">
            <v-chip size="small" color="info">
              Length: {{ base64String?.length.toLocaleString() || 0 }}
            </v-chip>
            <v-chip size="small" color="success" v-if="base64String">
              Ready to use
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DocumentType } from '@/types'

interface Props {
  previewUrl: string | null
  base64String: string
  selectedType: DocumentType | null
  fileSize: string
}

interface Emits {
  (e: 'copy-to-clipboard', text: string): void
  (e: 'download-base64', filename: string, content: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const imageDimensions = ref<string>('')

const onImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  imageDimensions.value = `${img.naturalWidth}x${img.naturalHeight}`
}

const onImageError = () => {
  console.error('Failed to load image preview')
}

const copyToClipboard = () => {
  emit('copy-to-clipboard', props.base64String)
}

const downloadBase64 = () => {
  const filename = `${props.selectedType}_base64_${Date.now()}.txt`
  emit('download-base64', filename, props.base64String)
}
</script>

<style scoped>
.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  object-fit: contain;
}

.base64-output {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.gap-2 {
  gap: 8px;
}
</style>

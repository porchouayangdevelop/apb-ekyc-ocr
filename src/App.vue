<template>
  <v-app>
    <router-view />
  </v-app>
</template>


<script lang="ts" setup>
import { onMounted } from 'vue'
import { useOcrStore } from '@/stores/ocrStore'

const ocrStore = useOcrStore()

// Initialize store on app mount
onMounted(() => {
  ocrStore.initialize()
})

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
}

.v-app-bar-title {
  font-weight: 600;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>

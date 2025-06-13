<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOcrStore, type OcrResult } from '@/stores/ocrStore'

// Store
const ocrStore = useOcrStore()

// State
const drawer = ref(false)
const currentPage = ref('home')
const ocrResults = ref<OcrResult[]>([])
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Computed
const userInfo = computed(() => ocrStore.authState.user || { username: 'User' })

// Navigation
const navigationItems = [
  { title: 'Home', icon: 'mdi-home', to: '/home', page: 'home' },
  { title: 'OCR Processing', icon: 'mdi-eye-scan', to: '/ocr', page: 'ocr' },
  { title: 'Results', icon: 'mdi-table', to: '/results', page: 'results' }
]

// Methods
const onAuthenticated = () => {
  showSnackbar('Authentication successful! Welcome to OCR Processor.', 'success')
  currentPage.value = 'home'
}

const handleLogout = () => {
  ocrStore.logout()
  ocrResults.value = []
  currentPage.value = 'home'
  showSnackbar('Logged out successfully', 'info')
}

const onResultAdded = (result: OcrResult) => {
  ocrResults.value.unshift(result)
  showSnackbar('OCR processing completed successfully!', 'success')
  currentPage.value = 'results'
}

const onResultRemoved = (id: string) => {
  const index = ocrResults.value.findIndex(result => result.id === id)
  if (index > -1) {
    ocrResults.value.splice(index, 1)
    showSnackbar('Result removed', 'info')
  }
}

const showSnackbar = (message: string, color = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

// Initialize
onMounted(() => {
  ocrStore.initialize()
})
</script>

<template>
  <v-app>
    <!-- Authentication View -->
    <div v-if="!ocrStore.isAuthenticated" class="auth-container">
      <v-container fluid class="fill-height">
        <v-row justify="center" align="center" class="fill-height">
          <v-col cols="12" sm="8" md="6" lg="4">
            <AuthenticateSession @authenticated="onAuthenticated" />
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Main Application Layout -->
    <div v-else>
      <v-app-bar color="primary" density="compact" elevation="2">
        <v-app-bar-title>
          <v-icon class="mr-2">mdi-image-text</v-icon>
          OCR Document Processor
        </v-app-bar-title>

        <template v-slot:append>
          <v-menu>
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
        </template>
      </v-app-bar>

      <v-navigation-drawer
        v-model="drawer"
        temporary
      >
        <v-list>
          <v-list-item
            v-for="item in navigationItems"
            :key="item.title"
            :to="item.to"
            @click="currentPage = item.page"
          >
            <template v-slot:prepend>
              <v-icon>{{ item.icon }}</v-icon>
            </template>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <v-container>
          <!-- Navigation Tabs -->
          <v-tabs v-model="currentPage" class="mb-6">
            <v-tab value="home">
              <v-icon class="mr-2">mdi-home</v-icon>
              Home
            </v-tab>
            <v-tab value="ocr">
              <v-icon class="mr-2">mdi-eye-scan</v-icon>
              OCR Processing
            </v-tab>
            <v-tab value="results">
              <v-icon class="mr-2">mdi-table</v-icon>
              Results
            </v-tab>
          </v-tabs>

          <!-- Tab Content -->
          <v-tabs-window v-model="currentPage">
            <!-- Home Page -->
            <v-tabs-window-item value="home">
              <HomePage />
            </v-tabs-window-item>

            <!-- OCR Processing Page -->
            <v-tabs-window-item value="ocr">
              <OcrProcessingPage @result-added="onResultAdded" />
            </v-tabs-window-item>

            <!-- Results Page -->
            <v-tabs-window-item value="results">
              <ResultsPage :results="ocrResults" @result-removed="onResultRemoved" />
            </v-tabs-window-item>
          </v-tabs-window>
        </v-container>
      </v-main>

      <!-- Footer -->
      <v-footer class="bg-grey-lighten-1">
        <v-row>
          <v-col class="text-center" cols="12">
            <strong>OCR Document Processor</strong> -
            Authenticated as {{ userInfo.username }} -
            {{ new Date().getFullYear() }}
          </v-col>
        </v-row>
      </v-footer>
    </div>

    <!-- Global Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="bottom right"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.fill-height {
  height: 100vh;
}

.v-app-bar-title {
  font-weight: 600;
}
</style>

<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height auth-container">
        <v-row justify="center" align="center" class="fill-height">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card elevation="8" class="auth-card rounded-lg shadow-lg">
              <v-card-title class="text-center py-6">
                <v-icon size="48" color="primary" class="mb-4">mdi-shield-lock</v-icon>
                <h2 class="text-h4 font-weight-bold">OCR Login</h2>
              </v-card-title>

              <v-card-text class="px-6">
                <v-form ref="loginForm" v-model="isFormValid" @submit.prevent="handleLogin">
                  <v-text-field
                    v-model="credentials.username"
                    label="Username"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    :rules="usernameRules"
                    :disabled="isLoading"
                    class="mb-3"
                    autocomplete="username"
                  ></v-text-field>

                  <v-text-field
                    v-model="credentials.password"
                    label="Password"
                    prepend-inner-icon="mdi-lock"
                    :type="showPassword ? 'text' : 'password'"
                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showPassword = !showPassword"
                    variant="outlined"
                    :rules="passwordRules"
                    :disabled="isLoading"
                    class="mb-3"
                    autocomplete="current-password"
                  ></v-text-field>



                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    :loading="isLoading"
                    :disabled="!isFormValid"
                    class="mb-4"
                  >
                    <v-icon start>mdi-login</v-icon>
                    {{ isLoading ? 'Authenticating...' : 'Login' }}
                  </v-btn>

                  <v-alert
                    v-if="error"
                    type="success"
                    variant="tonal"
                    class="mb-4"
                  >
                    {{ error }}
                  </v-alert>

                  <v-alert
                    v-if="isLoading"
                    type="info"
                    variant="tonal"
                    class="mb-4"
                  >
                    <template #title>Processing Authentication</template>
                    <div class="d-flex align-center">
                      <v-progress-circular size="20" indeterminate class="mr-2"></v-progress-circular>
                      {{ loadingMessage }}
                    </div>
                  </v-alert>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOcrStore } from '@/stores/ocrStore'
import type { AuthRequest } from '@/services/api'

const router = useRouter()
const ocrStore = useOcrStore()

// State
const isFormValid = ref(false)
const showPassword = ref(false)
const loadingMessage = ref('')

const credentials = ref<AuthRequest>({
  username: '',
  password: '',
  messagecode: '',
  clientUid: ''
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success' as 'success' | 'error' | 'warning' | 'info'
})

// Computed
const isLoading = computed(() => ocrStore.isLoading)
const error = computed(() => ocrStore.error)

// Validation rules
const usernameRules = [
  (v: string) => !!v || 'Username is required',
  (v: string) => v.length >= 3 || 'Username must be at least 3 characters'
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters'
]

// Methods
const handleLogin = async () => {
  if (!isFormValid.value) return

  try {
    loadingMessage.value = 'Encoding password...'

    // First encode the password
    await ocrStore.encodePassword()

    loadingMessage.value = 'Authenticating...'

    // Then login with encoded password
    await ocrStore.login(credentials.value)

    showSnackbar('Login successful! Welcome to OCR Processor.', 'success')

    // Redirect to main pages
    await router.push('/')

  } catch (error: any) {
    showSnackbar(error.message || 'Authentication failed', 'error')
  }
}

const showSnackbar = (message: string, color: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

// Check if already authenticated
onMounted(() => {
  if (ocrStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style scoped>
.auth-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}


.fill-height {
  height: 100vh;
}
</style>

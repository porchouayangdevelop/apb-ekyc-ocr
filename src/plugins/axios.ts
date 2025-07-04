import axios, {type AxiosInstance, type AxiosRequestConfig, type AxiosResponse} from 'axios'
import type {App} from 'vue'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use((config:AxiosRequestConfig) =>{
  const token =localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  if(token && config.headers)  config.headers.Authorization = `${token}`;

  if(import.meta.env.DEV){
    console.log('🚀 Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data
    })
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('✅ Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      })
    }

    return response
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('auth_token')
          // You can add router redirect here if needed
          break
        case 403:
          console.error('❌ Forbidden: Insufficient permissions')
          break
        case 404:
          console.error('❌ Not Found: Resource not found')
          break
        case 500:
          console.error('❌ Server Error: Internal server error')
          break
        default:
          console.error(`❌ Error ${status}:`, data?.message || error.message)
      }
    } else if (error.request) {
      console.error('❌ Network Error: No response received')
    } else {
      console.error('❌ Request Setup Error:', error.message)
    }

    return Promise.reject(error)
  }
)

export  default  {
  install(app: App) {
    app.config.globalProperties.$axios = axiosInstance
    app.provide("axios",axiosInstance)
  }
}

export {axiosInstance as axios}

/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'
import {useOcrStore} from '@/stores/ocrStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})


router.beforeEach(async (to,from,next)=>{
  const ocrStore = useOcrStore();

  if(!ocrStore.authState.accessToken){
    ocrStore.restoreAuth();
  }

  const publicRoute = ['/login','/'];
  const isPublicRoute = publicRoute.includes(to.path);

  const isAuthenticated = ocrStore.isAuthenticated;

  // If route requires auth and user is not authenticated
  if (!isPublicRoute && !isAuthenticated) {
    console.log('🔒 Authentication required, redirecting to login')
    return next('/login')
  }

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (isAuthenticated && to.path === '/login') {
    console.log('✅ Already authenticated, redirecting to dashboard')
    return next('/dashboard')
  }

  // If accessing root and authenticated, redirect to dashboard
  if (isAuthenticated && to.path === '/') {
    console.log('✅ Redirecting authenticated user to dashboard')
    return next('/dashboard')
  }

  next()


});

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router

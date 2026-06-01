import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import UserDashboard from '../views/UserDashboard.vue'
import GadgetDetailView from '../views/GadgetDetailView.vue'
import AboutView from '../views/AboutView.vue'
import CompareView from '../views/CompareView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView
    },
    {
      path: '/compare',
      name: 'compare',
      component: CompareView
    },
    {
      path: '/gadget/:id',
      name: 'gadget-detail',
      component: GadgetDetailView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../views/AuthCallbackView.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboard,
      meta: { requiresAuth: true, role: 'admin' }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: UserDashboard,
      meta: { requiresAuth: true, role: 'member' }
    }
  ]
})

// Simple Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  // If already logged in, keep user away from login page
  if (to.name === 'login' && token) {
    return next(role === 'admin' ? '/admin' : '/')
  }

  if (to.meta.requiresAuth) {
    if (!token) {
      return next('/login')
    }
    if (to.meta.role && to.meta.role !== role) {
      // Fallback redirect based on current role
      return next(role === 'admin' ? '/admin' : '/')
    }
  }

  next()
})

export default router
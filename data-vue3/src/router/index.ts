import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../components/layout/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AppLayout,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/register/RegisterView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'errorpage',
      component: () => import('../components/ErrorPage.vue'),
    },
  ],
})

export default router

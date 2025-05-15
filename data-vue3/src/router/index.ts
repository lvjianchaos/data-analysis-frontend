import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../components/layout/AppLayout.vue'
import { useTokenStore } from '@/stores/token'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AppLayout,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '',
          name: 'index',
          component: () => import('../views/IndexView.vue'),
        },
        {
          path: '/data/:id',
          name: 'data',
          component: () => import('../views/data/DataView.vue'),
        },
        {
          path: '/test',
          name: 'test',
          component: () => import('../views/test/TestView.vue'),
        },
      ],
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

router.beforeEach((to, from, next) => {
  if (to.matched.some((r) => r.meta?.requiresAuth)) {
    const tokenStore = useTokenStore()

    if (tokenStore.isLoggedIn) {
      next()
    } else {
      next({ name: 'login', query: { redirect: to.fullPath } })
    }
  }

  next()
})
export default router

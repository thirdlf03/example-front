import { createRouter, createWebHistory } from 'vue-router';
import { getCurrentUser } from 'aws-amplify/auth';

// Import components
import LoginComponent from '../components/LoginComponent.vue';
import ApiTest from '../components/ApiTest.vue';
import TheWelcome from '../components/TheWelcome.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: TheWelcome,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginComponent,
    meta: { requiresAuth: false }
  },
  {
    path: '/api-test',
    name: 'api-test',
    component: ApiTest,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  if (requiresAuth) {
    try {
      await getCurrentUser();
      next();
    } catch (error) {
      next('/login');
    }
  } else {
    next();
  }
});

export default router;
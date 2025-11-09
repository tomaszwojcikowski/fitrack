import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'workout',
    component: () => import('../views/WorkoutView.vue'),
    meta: { title: 'Workout' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { title: 'Dashboard' },
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('../views/HistoryView.vue'),
    meta: { title: 'History' },
  },
  {
    path: '/programs',
    name: 'programs',
    component: () => import('../views/ProgramsView.vue'),
    meta: { title: 'Programs' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { title: 'Settings' },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  document.title = `FiTrack - ${to.meta.title || 'Fitness Tracker'}`;
  next();
});

export default router;

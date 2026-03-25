import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import MietzinsPage from './pages/MietzinsPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/mietzins', component: MietzinsPage },
  ],
})

export default router

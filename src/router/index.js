import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import WorkspaceDetailView from '../views/WorkspaceDetailView.vue'
import ProjectDetailView from '../views/ProjectDetailView.vue'
import GuidePage from '../views/GuidePage.vue'
import MobileFallbackView from '../views/MobileFallbackView.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView
  },
  {
    path: '/guide',
    name: 'guide',
    component: GuidePage
  },
  {
    path: '/workspace/:workspaceId',
    name: 'workspace-detail',
    component: WorkspaceDetailView,
    props: true
  },
  {
    path: '/workspace/:workspaceId/project/:projectId',
    name: 'project-detail',
    component: ProjectDetailView,
    props: true
  },
  {
    path: '/desktop-only',
    name: 'desktop-only',
    component: MobileFallbackView,
    meta: { layout: 'blank' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from) => {
  const isMobile = window.innerWidth < 1024
  
  if (isMobile) {
    if (to.name !== 'desktop-only') {
      return { 
        name: 'desktop-only',
        query: { redirect: to.fullPath }
      }
    }
  } else {
    if (to.name === 'desktop-only') {
      const redirectPath = to.query.redirect || '/'
      return { path: redirectPath }
    }
  }
})

export default router

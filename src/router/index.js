import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import WorkspaceDetailView from '../views/WorkspaceDetailView.vue'
import ProjectDetailView from '../views/ProjectDetailView.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView
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
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkNoteStore } from '../../stores/workNoteStore'
import { Briefcase, FolderKanban, Plus, LayoutDashboard, ChevronRight, ChevronDown, BookOpen } from 'lucide-vue-next'
import WorkspaceForm from '../workspace/WorkspaceForm.vue'

const store = useWorkNoteStore()
const route = useRoute()
const router = useRouter()

const isWorkspaceModalOpen = ref(false)
const editingWorkspace = ref(null)

const activeWorkspaceId = computed(() => route.params.workspaceId)
const activeProjectId = computed(() => route.params.projectId)

const workspaces = computed(() => store.workspaces)

const projectsByWorkspace = computed(() => {
  const map = {}
  store.workspaces.forEach(w => {
    map[w.id] = store.getProjectsByWorkspace(w.id)
  })
  return map
})

const openWorkspaceForm = (workspace = null) => {
  editingWorkspace.value = workspace
  isWorkspaceModalOpen.value = true
}

const handleWorkspaceSaved = () => {
  isWorkspaceModalOpen.value = false
  editingWorkspace.value = null
}
</script>

<template>
  <aside class="w-64 border-r border-neutral-800 bg-neutral-950/70 backdrop-blur-xl flex flex-col h-screen select-none">
    <!-- Brand / Header -->
    <div id="sidebar-brand" class="h-14 border-b border-neutral-800 flex items-center px-6 gap-2.5">
      <div class="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-violet-500/20">
        W
      </div>
      <div>
        <h1 class="text-sm font-semibold text-white tracking-wide">Work Note</h1>
        <p class="text-[10px] text-neutral-500 font-medium leading-none">Task Log System</p>
      </div>
    </div>

    <!-- Navigation List -->
    <div class="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      <!-- General Link -->
      <div>
        <router-link
          id="sidebar-dashboard-link"
          to="/"
          class="flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          :class="route.name === 'dashboard' ? 'bg-neutral-800/80 text-violet-400 font-semibold' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'"
        >
          <LayoutDashboard class="w-4 h-4" />
          Dashboard
        </router-link>
      </div>

      <!-- Workspaces section -->
      <div class="space-y-2">
        <div class="flex items-center justify-between px-3">
          <span class="text-[10px] font-bold text-neutral-500 tracking-wider uppercase">Tempat Kerja</span>
          <button
            id="sidebar-add-workspace-btn"
            @click="openWorkspaceForm()"
            class="text-neutral-400 hover:text-white p-0.5 hover:bg-neutral-800 rounded transition cursor-pointer"
            title="Tambah Tempat Kerja"
          >
            <Plus class="w-3.5 h-3.5" />
          </button>
        </div>

        <div v-if="workspaces.length === 0" class="px-3 py-2 text-xs text-neutral-600 italic">
          Belum ada tempat kerja.
        </div>

        <ul v-else class="space-y-1">
          <li v-for="workspace in workspaces" :key="workspace.id" class="space-y-0.5">
            <!-- Workspace Row -->
            <router-link
              :to="`/workspace/${workspace.id}`"
              class="group flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all duration-150 cursor-pointer"
              :class="activeWorkspaceId === workspace.id ? 'bg-neutral-800/50 text-white font-medium border border-neutral-700/30' : 'text-neutral-400 hover:bg-neutral-900/60 hover:text-neutral-200'"
            >
              <div class="flex items-center gap-2.5 truncate">
                <Briefcase class="w-3.5 h-3.5 flex-shrink-0" :class="activeWorkspaceId === workspace.id ? 'text-violet-400' : 'text-neutral-500'" />
                <span class="truncate">{{ workspace.name }}</span>
              </div>
              
              <ChevronDown v-if="activeWorkspaceId === workspace.id" class="w-3 h-3 text-neutral-500 flex-shrink-0" />
              <ChevronRight v-else class="w-3 h-3 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </router-link>

            <!-- Projects Sub-list (Visible if active workspace) -->
            <ul v-if="activeWorkspaceId === workspace.id && projectsByWorkspace[workspace.id]?.length" class="pl-6 pr-1 py-1 space-y-0.5 border-l border-neutral-800 ml-5">
              <li v-for="project in projectsByWorkspace[workspace.id]" :key="project.id">
                <router-link
                  :to="`/workspace/${workspace.id}/project/${project.id}`"
                  class="flex items-center gap-2 px-2.5 py-1.5 text-[11px] rounded-md transition-colors truncate cursor-pointer"
                  :class="activeProjectId === project.id ? 'bg-neutral-800/80 text-violet-400 font-semibold' : 'text-neutral-500 hover:bg-neutral-900 hover:text-neutral-300'"
                >
                  <FolderKanban class="w-3 h-3 flex-shrink-0" />
                  <span class="truncate">{{ project.name }}</span>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <!-- Guide Link (Bottom) -->
    <div class="px-3 py-3 border-t border-neutral-800/60">
      <router-link
        to="/guide"
        class="flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer"
        :class="route.name === 'guide' ? 'bg-violet-950/50 text-violet-400 font-semibold border border-violet-900/30' : 'text-neutral-500 hover:bg-neutral-900 hover:text-neutral-300'"
      >
        <BookOpen class="w-4 h-4" />
        Panduan
      </router-link>
    </div>

    <!-- Workspace Form Modal -->
    <WorkspaceForm
      v-if="isWorkspaceModalOpen"
      :workspace="editingWorkspace"
      @close="isWorkspaceModalOpen = false"
      @saved="handleWorkspaceSaved"
    />
  </aside>
</template>

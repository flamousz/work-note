<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkNoteStore } from '../stores/workNoteStore'
import { FolderKanban, Calendar, ArrowLeft, Plus, Edit, Briefcase, Award } from 'lucide-vue-next'
import ProjectForm from '../components/project/ProjectForm.vue'
import WorkspaceForm from '../components/workspace/WorkspaceForm.vue'

const props = defineProps({
  workspaceId: {
    type: String,
    required: true
  }
})

const route = useRoute()
const router = useRouter()
const store = useWorkNoteStore()

const isProjectModalOpen = ref(false)
const selectedProject = ref(null)
const isWorkspaceModalOpen = ref(false)

const workspace = computed(() => store.getWorkspaceById(props.workspaceId))

const projects = computed(() => store.getProjectsByWorkspace(props.workspaceId))

const openProjectForm = (project = null) => {
  selectedProject.value = project
  isProjectModalOpen.value = true
}

const handleProjectSaved = () => {
  isProjectModalOpen.value = false
  selectedProject.value = null
}

const openWorkspaceForm = () => {
  isWorkspaceModalOpen.value = true
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'belum_mulai':
      return 'bg-neutral-800 text-neutral-400 border-neutral-700/60'
    case 'dalam_pengerjaan':
      return 'bg-blue-950/45 text-blue-400 border-blue-900/40'
    case 'selesai':
      return 'bg-emerald-950/45 text-emerald-400 border-emerald-900/40'
    case 'tertunda':
      return 'bg-amber-950/45 text-amber-400 border-amber-900/40'
    default:
      return 'bg-neutral-800 text-neutral-400'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'belum_mulai': return 'Belum Mulai'
    case 'dalam_pengerjaan': return 'Dalam Pengerjaan'
    case 'selesai': return 'Selesai'
    case 'tertunda': return 'Tertunda'
    default: return status
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch (e) {
    return dateStr
  }
}

const getProjectDateRange = (project) => {
  if (!project.startDate && !project.endDate) return 'No schedule'
  const start = project.startDate ? formatDate(project.startDate) : '?'
  const end = project.endDate ? formatDate(project.endDate) : '?'
  return `${start} - ${end}`
}
</script>

<template>
  <div v-if="!workspace" class="p-8 text-center text-neutral-400">
    Workspace tidak ditemukan.
    <router-link to="/" class="text-violet-400 block mt-2">Kembali ke Dashboard</router-link>
  </div>

  <div v-else class="p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
    <!-- Back Navigation & Title -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1.5">
        <button 
          @click="router.push('/')" 
          class="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          Dashboard
        </button>
        
        <div class="flex items-center gap-3">
          <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">{{ workspace.name }}</h2>
          <button 
            @click="openWorkspaceForm" 
            class="text-neutral-500 hover:text-white p-1 hover:bg-neutral-800 rounded transition cursor-pointer"
            title="Edit Tempat Kerja"
          >
            <Edit class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Add Project Action -->
      <button
        @click="openProjectForm()"
        class="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg shadow-md transition cursor-pointer"
      >
        <Plus class="w-3.5 h-3.5" />
        Tambah Project
      </button>
    </div>

    <!-- Workspace Metadata header box -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-950/45 border border-neutral-850 p-4 rounded-xl">
      <div class="flex items-center gap-3">
        <div class="h-9 w-9 rounded-lg bg-violet-600/10 flex items-center justify-center text-violet-400 border border-violet-900/30 flex-shrink-0">
          <Award class="w-4 h-4" />
        </div>
        <div class="space-y-0.5 min-w-0">
          <p class="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Posisi Kerja</p>
          <p class="text-xs text-neutral-300 font-semibold truncate">{{ workspace.position || '-' }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="h-9 w-9 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-400 border border-indigo-900/30 flex-shrink-0">
          <Calendar class="w-4 h-4" />
        </div>
        <div class="space-y-0.5 min-w-0">
          <p class="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Durasi Kontrak</p>
          <p class="text-xs text-neutral-300 font-semibold truncate">{{ workspace.contractDuration || '-' }}</p>
        </div>
      </div>
    </div>

    <!-- Projects List section -->
    <div class="space-y-4 pt-2">
      <h3 class="text-sm font-semibold text-neutral-300 tracking-wide">Semua Project</h3>
      
      <!-- Empty State -->
      <div 
        v-if="projects.length === 0" 
        class="border border-dashed border-neutral-850 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3 bg-neutral-950/15"
      >
        <FolderKanban class="w-10 h-10 text-neutral-600" />
        <div class="space-y-1">
          <h4 class="text-sm font-semibold text-neutral-300">Belum Ada Project</h4>
          <p class="text-xs text-neutral-500 max-w-sm">Tambahkan project baru yang sedang Anda kerjakan di tempat kerja ini.</p>
        </div>
        <button
          @click="openProjectForm()"
          class="mt-2 flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg transition cursor-pointer"
        >
          Buat Project Pertama
        </button>
      </div>

      <!-- Project Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div 
          v-for="project in projects" 
          :key="project.id"
          @click="router.push(`/workspace/${workspaceId}/project/${project.id}`)"
          class="group bg-neutral-900/40 border border-neutral-850 hover:border-neutral-700/60 p-5 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md hover:bg-neutral-900/60 transition-all duration-200 cursor-pointer"
        >
          <div class="space-y-3.5">
            <!-- Header (Title & Status) -->
            <div class="flex items-start justify-between gap-3">
              <h4 class="text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors truncate">
                {{ project.name }}
              </h4>
              <button 
                @click.stop="openProjectForm(project)"
                class="text-neutral-500 hover:text-white p-1 hover:bg-neutral-800 rounded transition cursor-pointer flex-shrink-0"
                title="Edit Project"
              >
                <Edit class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Description (HTML parsed) -->
            <div 
              v-if="project.description" 
              class="text-neutral-400 text-xs line-clamp-3 prose prose-invert overflow-hidden border-l border-neutral-800 pl-3 leading-relaxed"
              v-html="project.description"
            ></div>
            <div v-else class="text-neutral-600 text-xs italic">
              Tidak ada deskripsi.
            </div>
          </div>

          <!-- Bottom details -->
          <div class="flex items-center justify-between mt-6 pt-3.5 border-t border-neutral-850 text-[10px] text-neutral-400">
            <!-- Badge -->
            <span 
              class="px-2 py-0.5 rounded font-bold uppercase tracking-wider border text-[9px]"
              :class="getStatusBadgeClass(project.status)"
            >
              {{ getStatusLabel(project.status) }}
            </span>

            <span class="flex items-center gap-1 font-semibold text-neutral-400">
              <Calendar class="w-3.5 h-3.5 text-neutral-500" />
              {{ getProjectDateRange(project) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ProjectForm
      v-if="isProjectModalOpen"
      :workspace-id="workspaceId"
      :project="selectedProject"
      @close="isProjectModalOpen = false"
      @saved="handleProjectSaved"
    />

    <WorkspaceForm
      v-if="isWorkspaceModalOpen"
      :workspace="workspace"
      @close="isWorkspaceModalOpen = false"
      @saved="isWorkspaceModalOpen = false"
    />
  </div>
</template>

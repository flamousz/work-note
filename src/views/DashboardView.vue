<script setup>
import { ref, computed } from 'vue'
import { useWorkNoteStore } from '../stores/workNoteStore'
import { Briefcase, Calendar, User, ArrowRight, Edit, Plus, FolderKanban } from 'lucide-vue-next'
import WorkspaceForm from '../components/workspace/WorkspaceForm.vue'

const store = useWorkNoteStore()

const isModalOpen = ref(false)
const selectedWorkspace = ref(null)

const workspaces = computed(() => store.workspaces)

const getProjectCount = (workspaceId) => {
  return store.getProjectsByWorkspace(workspaceId).length
}

const openForm = (workspace = null) => {
  selectedWorkspace.value = workspace
  isModalOpen.value = true
}

const handleSaved = () => {
  isModalOpen.value = false
  selectedWorkspace.value = null
}
</script>

<template>
  <div class="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
    <!-- Hero Header banner -->
    <div class="relative bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-neutral-900 border border-violet-950/45 p-8 rounded-2xl overflow-hidden shadow-lg">
      <div class="absolute right-0 top-0 translate-x-12 -translate-y-12 h-64 w-64 bg-violet-600/10 blur-3xl rounded-full"></div>
      
      <div class="max-w-xl space-y-3 relative z-10">
        <span class="text-[10px] uppercase font-bold tracking-widest text-violet-400 bg-violet-950/60 px-3 py-1 rounded-full border border-violet-800/40">Task Log</span>
        <h2 class="text-2xl font-bold text-white tracking-tight sm:text-3xl">Kelola Pekerjaan & Note Dengan Mudah</h2>
        <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed">
          Sistem logging terstruktur untuk melacak progress Tempat Kerja, Project, Modul hingga Submodul kerja secara cepat, ringan, dan tersimpan aman di browsermu.
        </p>
      </div>
    </div>

    <!-- Workspace Grid -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-semibold text-white">Daftar Tempat Kerja</h3>
          <p class="text-xs text-neutral-500">Pilih tempat kerja untuk melihat project aktif.</p>
        </div>
        <button
          @click="openForm()"
          class="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg shadow-md transition cursor-pointer"
        >
          <Plus class="w-3.5 h-3.5" />
          Tambah Baru
        </button>
      </div>

      <!-- Empty State -->
      <div 
        v-if="workspaces.length === 0" 
        class="border border-dashed border-neutral-800 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3 bg-neutral-950/10"
      >
        <Briefcase class="w-10 h-10 text-neutral-600" />
        <div class="space-y-1">
          <h4 class="text-sm font-semibold text-neutral-300">Belum Ada Tempat Kerja</h4>
          <p class="text-xs text-neutral-500 max-w-sm">Mulai dengan menambahkan tempat kerja baru tempat Anda bekerja saat ini.</p>
        </div>
        <button
          @click="openForm()"
          class="mt-2 flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg transition cursor-pointer"
        >
          Buat Tempat Kerja Pertama
        </button>
      </div>

      <!-- Grid list -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div 
          v-for="ws in workspaces" 
          :key="ws.id"
          class="group bg-neutral-900/40 border border-neutral-850 hover:border-neutral-700/60 p-5 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md hover:bg-neutral-900/60 transition-all duration-200"
        >
          <div class="space-y-4">
            <!-- Title & Edit -->
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <h4 class="text-sm font-semibold text-neutral-100 group-hover:text-white transition-colors truncate max-w-[170px]">
                  {{ ws.name }}
                </h4>
                <span class="inline-flex items-center gap-1 text-[10px] text-violet-400 bg-violet-950/30 px-2 py-0.5 rounded border border-violet-900/30 font-medium">
                  <FolderKanban class="w-3 h-3" />
                  {{ getProjectCount(ws.id) }} Project
                </span>
              </div>
              <button 
                @click.stop="openForm(ws)"
                class="text-neutral-500 hover:text-white p-1 hover:bg-neutral-850 rounded transition cursor-pointer"
                title="Edit Tempat Kerja"
              >
                <Edit class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Details metadata -->
            <div class="space-y-2 text-xs text-neutral-400 border-t border-neutral-850 pt-3.5">
              <div v-if="ws.position" class="flex items-center gap-2">
                <User class="w-3.5 h-3.5 text-neutral-500" />
                <span class="truncate">{{ ws.position }}</span>
              </div>
              <div v-if="ws.contractDuration" class="flex items-center gap-2">
                <Calendar class="w-3.5 h-3.5 text-neutral-500" />
                <span class="truncate">{{ ws.contractDuration }}</span>
              </div>
            </div>
          </div>

          <!-- Open button -->
          <router-link
            :to="`/workspace/${ws.id}`"
            class="mt-5 flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-neutral-300 group-hover:text-white bg-neutral-950/50 hover:bg-neutral-950 border border-neutral-800 rounded-lg group-hover:border-violet-700/40 transition-all cursor-pointer"
          >
            Masuk Workspace
            <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </router-link>
        </div>
      </div>
    </div>

    <!-- Workspace Form Modal -->
    <WorkspaceForm
      v-if="isModalOpen"
      :workspace="selectedWorkspace"
      @close="isModalOpen = false"
      @saved="handleSaved"
    />
  </div>
</template>

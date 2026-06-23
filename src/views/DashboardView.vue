<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWorkNoteStore } from '../stores/workNoteStore'
import { Briefcase, Calendar, User, ArrowRight, Edit, Plus, FolderKanban, Sparkles, X, Play, Rocket } from 'lucide-vue-next'
import WorkspaceForm from '../components/workspace/WorkspaceForm.vue'
import { useOnboarding } from '../composables/useOnboarding'
import { differenceInDays } from 'date-fns'

const store = useWorkNoteStore()
const { hasCompletedTour, startDashboardTour } = useOnboarding()

const isModalOpen = ref(false)
const selectedWorkspace = ref(null)
const showWelcomePrompt = ref(false)

const workspaces = computed(() => store.workspaces)

const getProjectCount = (workspaceId) => {
  return store.getProjectsByWorkspace(workspaceId).length
}

const getContractLabel = (ws) => {
  if (ws.contractType === 'tetap') {
    return 'Karyawan Tetap'
  }
  
  if (!ws.startContract || !ws.endContract) {
    return ws.contractDuration || '-'
  }
  
  const start = new Date(ws.startContract)
  const end = new Date(ws.endContract)
  
  const totalDays = differenceInDays(end, start) + 1
  if (totalDays <= 0) return '0 Hari'
  
  const approximateMonths = totalDays / 30.4375
  const roundedMonths = Math.round(approximateMonths)
  
  if (roundedMonths >= 1) {
    const errorDays = Math.abs(totalDays - roundedMonths * 30.4375)
    if (errorDays < 3.5) {
      return `Kontrak: ${roundedMonths} Bulan`
    }
    
    const months = Math.floor(totalDays / 30.4375)
    const remainingDays = Math.round(totalDays - (months * 30.4375))
    
    if (months > 0 && remainingDays > 0) {
      return `Kontrak: ${months} Bulan ${remainingDays} Hari`
    } else if (months > 0) {
      return `Kontrak: ${months} Bulan`
    }
  }
  
  return `Kontrak: ${totalDays} Hari`
}

const openForm = (workspace = null) => {
  selectedWorkspace.value = workspace
  isModalOpen.value = true
}

const handleSaved = () => {
  isModalOpen.value = false
  selectedWorkspace.value = null
}

// First-visit detection
onMounted(() => {
  if (!hasCompletedTour.value) {
    // Small delay so DOM is fully rendered
    setTimeout(() => {
      showWelcomePrompt.value = true
    }, 800)
  }
})

const startTourFromPrompt = () => {
  showWelcomePrompt.value = false
  // Small delay for prompt exit animation
  setTimeout(() => {
    startDashboardTour()
  }, 300)
}

const dismissPrompt = () => {
  showWelcomePrompt.value = false
}
</script>

<template>
  <div class="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
    <!-- Hero Header banner -->
    <div id="dashboard-hero" class="relative bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-neutral-900 border border-violet-950/45 p-8 rounded-2xl overflow-hidden shadow-lg">
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
    <div id="dashboard-workspace-section" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-semibold text-white">Daftar Tempat Kerja</h3>
          <p class="text-xs text-neutral-500">Pilih tempat kerja untuk melihat project aktif.</p>
        </div>
        <button
          id="dashboard-add-workspace-btn"
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
              <div class="flex items-center gap-2">
                <Calendar class="w-3.5 h-3.5 text-neutral-500" />
                <span class="truncate">{{ getContractLabel(ws) }}</span>
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

    <!-- Welcome / First-Visit Prompt -->
    <Teleport to="body">
      <Transition name="prompt-fade">
        <div
          v-if="showWelcomePrompt"
          class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
          <!-- Backdrop -->
          <div
            class="absolute inset-0 bg-black/70 backdrop-blur-sm"
            @click="dismissPrompt"
          ></div>

          <!-- Prompt Card -->
          <div class="relative bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl shadow-violet-500/5 max-w-md w-full p-8 space-y-6 animate-fade-in">
            <!-- Close button -->
            <button
              @click="dismissPrompt"
              class="absolute top-4 right-4 text-neutral-500 hover:text-white p-1 hover:bg-neutral-800 rounded-lg transition cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>

            <!-- Icon -->
            <div class="flex justify-center">
              <div class="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-800/40 flex items-center justify-center">
                <Sparkles class="w-8 h-8 text-violet-400" />
              </div>
            </div>

            <!-- Content -->
            <div class="text-center space-y-2">
              <h3 class="text-lg font-bold text-white">Selamat Datang! 👋</h3>
              <p class="text-sm text-neutral-400 leading-relaxed">
                Sepertinya ini pertama kalinya kamu menggunakan <span class="text-violet-400 font-semibold">Work Note</span>.
                Mau kami pandu untuk mengenal fitur-fitur utamanya?
              </p>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-2.5">
              <button
                @click="startTourFromPrompt"
                class="group flex items-center justify-center gap-2.5 w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-violet-500/15 transition-all cursor-pointer"
              >
                <Play class="w-4 h-4" />
                Ya, Mulai Tur!
              </button>
              <button
                @click="dismissPrompt"
                class="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-all cursor-pointer"
              >
                <Rocket class="w-4 h-4" />
                Nanti Saja, Langsung Mulai
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

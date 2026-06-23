<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkNoteStore } from '../stores/workNoteStore'
import draggable from 'vuedraggable'
import { ArrowLeft, Plus, Edit, Eye, GripVertical, Calendar, FolderKanban, ClipboardList } from 'lucide-vue-next'
import ModuleForm from '../components/module/ModuleForm.vue'
import SubmoduleForm from '../components/submodule/SubmoduleForm.vue'
import ProjectForm from '../components/project/ProjectForm.vue'
import SubmoduleCard from '../components/submodule/SubmoduleCard.vue'

const props = defineProps({
  workspaceId: {
    type: String,
    required: true
  },
  projectId: {
    type: String,
    required: true
  }
})

const route = useRoute()
const router = useRouter()
const store = useWorkNoteStore()

// Modal states
const isProjectModalOpen = ref(false)
const isModuleModalOpen = ref(false)
const isSubmoduleModalOpen = ref(false)

// Active selections for editing
const selectedModule = ref(null)
const selectedSubmodule = ref(null)
const activeModuleIdForAdd = ref(null)

const project = computed(() => store.getProjectById(props.projectId))
const workspace = computed(() => store.getWorkspaceById(props.workspaceId))

// Modules setup
const modules = computed(() => store.getModulesByProject(props.projectId))
const localModules = ref([])

watch(modules, (newVal) => {
  localModules.value = [...newVal]
}, { immediate: true, deep: true })

// Submodules setup
const submodulesByModule = ref({})

watch(
  [modules, () => store.submodules],
  () => {
    modules.value.forEach(m => {
      submodulesByModule.value[m.id] = store.getSubmodulesByModule(m.id)
    })
  },
  { immediate: true, deep: true }
)

// CRUD triggers
const openProjectForm = () => {
  isProjectModalOpen.value = true
}

const openModuleForm = (mod = null) => {
  selectedModule.value = mod
  isModuleModalOpen.value = true
}

const openSubmoduleForm = (sub = null, targetModuleId = null) => {
  selectedSubmodule.value = sub
  activeModuleIdForAdd.value = targetModuleId
  isSubmoduleModalOpen.value = true
}

// Drag & drop logic
const onModuleDrag = () => {
  store.updateModulesOrder(props.projectId, localModules.value.map(m => m.id))
}

const onSubmoduleDrag = (evt, moduleId) => {
  if (evt.added) {
    const submodule = evt.added.element
    // Update relationship in Pinia store
    store.updateSubmodule(submodule.id, { moduleId })
    // Reorder items in target module
    const orderedIds = submodulesByModule.value[moduleId].map(s => s.id)
    store.updateSubmodulesOrder(moduleId, orderedIds)
  } else if (evt.moved) {
    // Reorder items in source module
    const orderedIds = submodulesByModule.value[moduleId].map(s => s.id)
    store.updateSubmodulesOrder(moduleId, orderedIds)
  } else if (evt.removed) {
    // Reorder items in source module after removal
    const orderedIds = submodulesByModule.value[moduleId].map(s => s.id)
    store.updateSubmodulesOrder(moduleId, orderedIds)
  }
}

// Utility formatting
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  } catch (e) {
    return dateStr
  }
}

const getProjectDateRange = (p) => {
  if (!p.startDate && !p.endDate) return ''
  const start = p.startDate ? formatDate(p.startDate) : '?'
  const end = p.endDate ? formatDate(p.endDate) : '?'
  return `${start} - ${end}`
}
</script>

<template>
  <div v-if="!project" class="p-8 text-center text-neutral-400">
    Project tidak ditemukan.
    <router-link :to="`/workspace/${workspaceId}`" class="text-violet-400 block mt-2">Kembali ke Workspace</router-link>
  </div>

  <div v-else class="p-6 h-[calc(100vh-3.5rem)] flex flex-col gap-5 overflow-hidden animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
      <div class="space-y-1.5">
        <button 
          @click="router.push(`/workspace/${workspaceId}`)" 
          class="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          {{ workspace?.name || 'Workspace' }}
        </button>
        
        <div class="flex items-center gap-3">
          <h2 class="text-lg sm:text-xl font-bold text-white tracking-tight">{{ project.name }}</h2>
          <button 
            @click="openProjectForm" 
            class="text-neutral-500 hover:text-white p-1 hover:bg-neutral-800 rounded transition cursor-pointer"
            title="Edit Project"
          >
            <Edit class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Add Module Button -->
      <button
        id="project-add-module-btn"
        @click="openModuleForm()"
        class="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg shadow-md transition cursor-pointer"
      >
        <Plus class="w-3.5 h-3.5" />
        Tambah Modul
      </button>
    </div>

    <!-- Project Date / Description Bar -->
    <div 
      v-if="project.description || (project.startDate || project.endDate)" 
      class="bg-neutral-950/30 border border-neutral-850 p-3.5 rounded-xl text-xs flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3"
    >
      <div class="flex items-center gap-2 text-neutral-400">
        <Calendar class="w-4 h-4 text-violet-400" />
        <span class="font-medium">Jadwal: {{ getProjectDateRange(project) || 'Belum diatur' }}</span>
      </div>
      <div 
        v-if="project.description" 
        class="prose prose-invert max-w-xl text-neutral-400 line-clamp-1 leading-relaxed"
        v-html="project.description"
      ></div>
    </div>

    <!-- Kanban Board -->
    <div id="project-kanban" class="flex-1 overflow-x-auto min-h-0 pb-2">
      <!-- Empty State -->
      <div 
        v-if="localModules.length === 0" 
        class="h-full border border-dashed border-neutral-850 rounded-xl flex flex-col items-center justify-center gap-3 bg-neutral-950/15"
      >
        <ClipboardList class="w-10 h-10 text-neutral-600" />
        <div class="space-y-1 text-center">
          <h4 class="text-sm font-semibold text-neutral-300">Belum Ada Modul</h4>
          <p class="text-xs text-neutral-500 max-w-sm">Buat modul baru untuk membagi pekerjaan project ini menjadi bagian-bagian terpisah.</p>
        </div>
        <button
          @click="openModuleForm()"
          class="mt-2 flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg transition cursor-pointer"
        >
          Buat Modul Pertama
        </button>
      </div>

      <draggable
        v-else
        v-model="localModules"
        group="modules"
        @change="onModuleDrag"
        item-key="id"
        class="flex gap-5 h-full"
        handle=".column-handle"
        :animation="200"
        chosen-class="drag-chosen"
      >
        <template #item="{ element: mod }">
          <div class="w-72 bg-neutral-950/50 border border-neutral-850 rounded-xl flex flex-col max-h-full">
            
            <!-- Module Column Header -->
            <div class="p-3 border-b border-neutral-850 flex items-center justify-between gap-2 bg-neutral-950/80 rounded-t-xl flex-shrink-0 select-none">
              <!-- Reorder Handle & Name -->
              <div class="flex items-center gap-1.5 min-w-0">
                <button class="column-handle text-neutral-600 hover:text-neutral-300 p-0.5 cursor-grab active:cursor-grabbing">
                  <GripVertical class="w-3.5 h-3.5" />
                </button>
                <h3 class="text-xs font-bold text-neutral-200 truncate pr-1" :title="mod.name">
                  {{ mod.name }}
                </h3>
              </div>

              <!-- Actions (Edit & Count) -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <span class="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded-full font-bold">
                  {{ submodulesByModule[mod.id]?.length || 0 }}
                </span>
                <button 
                  @click="openModuleForm(mod)" 
                  class="text-neutral-500 hover:text-white p-0.5 hover:bg-neutral-800 rounded transition cursor-pointer"
                  title="Detail Modul"
                >
                  <Eye class="w-3 h-3" />
                </button>
              </div>
            </div>

            <!-- Submodules Draggable Area -->
            <div class="flex-1 overflow-y-auto p-3">
              <draggable
                v-model="submodulesByModule[mod.id]"
                group="submodules"
                @change="(evt) => onSubmoduleDrag(evt, mod.id)"
                item-key="id"
                ghost-class="ghost-card"
                class="space-y-3 min-h-[150px] h-full"
              >
                <template #item="{ element: sub }">
                  <SubmoduleCard 
                    :submodule="sub" 
                    @edit="(s) => openSubmoduleForm(s, mod.id)" 
                  />
                </template>
              </draggable>
            </div>

            <!-- Bottom Add Submodule Action -->
            <div class="p-2 border-t border-neutral-850/80 flex-shrink-0">
              <button
                @click="openSubmoduleForm(null, mod.id)"
                class="module-add-submodule-btn w-full py-1.5 flex items-center justify-center gap-1 text-[11px] text-neutral-400 hover:text-white bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-850 border-dashed rounded-lg transition-colors cursor-pointer"
              >
                <Plus class="w-3.5 h-3.5" />
                Tambah Submodul
              </button>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- Modals -->
    <ModuleForm
      v-if="isModuleModalOpen"
      :project-id="projectId"
      :module-item="selectedModule"
      @close="isModuleModalOpen = false"
      @saved="isModuleModalOpen = false"
    />

    <SubmoduleForm
      v-if="isSubmoduleModalOpen"
      :module-id="activeModuleIdForAdd"
      :submodule="selectedSubmodule"
      @close="isSubmoduleModalOpen = false"
      @saved="isSubmoduleModalOpen = false"
    />

    <ProjectForm
      v-if="isProjectModalOpen"
      :workspace-id="workspaceId"
      :project="project"
      @close="isProjectModalOpen = false"
      @saved="isProjectModalOpen = false"
    />
  </div>
</template>

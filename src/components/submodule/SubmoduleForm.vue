<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useWorkNoteStore } from '../../stores/workNoteStore'
import { X, Trash2, FileText, CheckSquare } from 'lucide-vue-next'
import RichTextEditor from '../editor/RichTextEditor.vue'
import DatePicker from 'primevue/datepicker'
import TaskChecklist from './TaskChecklist.vue'

const props = defineProps({
  moduleId: {
    type: String,
    required: true
  },
  submodule: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const store = useWorkNoteStore()

const name = ref('')
const description = ref('')
const startDate = ref('')
const endDate = ref('')
const status = ref('belum_mulai')
const targetModuleId = ref('')

const startDateObj = computed({
  get: () => startDate.value ? new Date(startDate.value) : null,
  set: (val) => {
    if (val) {
      const year = val.getFullYear()
      const month = String(val.getMonth() + 1).padStart(2, '0')
      const day = String(val.getDate()).padStart(2, '0')
      startDate.value = `${year}-${month}-${day}`
    } else {
      startDate.value = ''
    }
  }
})

const endDateObj = computed({
  get: () => endDate.value ? new Date(endDate.value) : null,
  set: (val) => {
    if (val) {
      const year = val.getFullYear()
      const month = String(val.getMonth() + 1).padStart(2, '0')
      const day = String(val.getDate()).padStart(2, '0')
      endDate.value = `${year}-${month}-${day}`
    } else {
      endDate.value = ''
    }
  }
})

watch([startDate, endDate], ([newStart, newEnd]) => {
  if (newStart && newEnd && newEnd < newStart) {
    endDate.value = newStart
  }
})

const isEdit = computed(() => !!props.submodule)
const isReadMode = ref(!!props.submodule)
const activeTab = ref('logtask')

const taskProgress = computed(() => {
  if (!props.submodule) return { done: 0, total: 0 }
  return store.getTaskProgress(props.submodule.id)
})

// Retrieve active project details for module re-assignment
const currentModule = computed(() => {
  const mId = props.submodule ? props.submodule.moduleId : props.moduleId
  return store.getModuleById(mId)
})

const projectId = computed(() => currentModule.value?.projectId)

const projectModules = computed(() => {
  if (!projectId.value) return []
  return store.getModulesByProject(projectId.value)
})

onMounted(() => {
  targetModuleId.value = props.moduleId
  if (props.submodule) {
    name.value = props.submodule.name
    description.value = props.submodule.description || ''
    startDate.value = props.submodule.startDate || ''
    endDate.value = props.submodule.endDate || ''
    status.value = props.submodule.status || 'belum_mulai'
    targetModuleId.value = props.submodule.moduleId
  }
})

const save = () => {
  if (!name.value.trim()) return

  const submoduleData = {
    moduleId: targetModuleId.value,
    name: name.value.trim(),
    description: description.value,
    startDate: startDate.value,
    endDate: endDate.value,
    status: status.value
  }

  if (isEdit.value) {
    store.updateSubmodule(props.submodule.id, submoduleData)
  } else {
    store.addSubmodule(submoduleData)
  }
  emit('saved')
}

const deleteSubmodule = () => {
  if (confirm(`Apakah lo yakin ingin menghapus submodul "${props.submodule.name}"?`)) {
    store.deleteSubmodule(props.submodule.id)
    emit('saved')
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')"></div>
    
    <!-- Modal Content -->
    <div class="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-350 z-10">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <h3 class="text-sm font-semibold text-white">
          {{ isEdit ? 'Detail Submodul Kerja' : 'Tambah Submodul Kerja' }}
        </h3>
        <button @click="emit('close')" class="text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 rounded transition cursor-pointer">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="save" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <!-- Nama Submodul -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-neutral-400">Nama Submodul <span class="text-violet-400">*</span></label>
          <input
            v-model="name"
            type="text"
            required
            :disabled="isReadMode"
            placeholder="Contoh: Implementasi UI Form Login"
            class="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 outline-none transition disabled:opacity-75 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:bg-neutral-950/40"
          />
        </div>

        <!-- Dates, Status, and Parent Module Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Start Date -->
          <div class="space-y-1.5 flex flex-col">
            <label class="text-xs font-semibold text-neutral-400">Tanggal Mulai</label>
            <DatePicker
              v-model="startDateObj"
              dateFormat="dd M yy"
              showIcon
              iconDisplay="input"
              placeholder="Pilih Tanggal Mulai"
              class="w-full"
              :disabled="isReadMode"
            />
          </div>

          <!-- End Date -->
          <div class="space-y-1.5 flex flex-col">
            <label class="text-xs font-semibold text-neutral-400">Tanggal Selesai</label>
            <DatePicker
              v-model="endDateObj"
              dateFormat="dd M yy"
              showIcon
              iconDisplay="input"
              placeholder="Pilih Tanggal Selesai"
              class="w-full"
              :disabled="isReadMode"
            />
          </div>

          <!-- Status -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-neutral-400">Status</label>
            <select
              v-model="status"
              :disabled="isReadMode"
              class="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:bg-neutral-950/40"
            >
              <option value="belum_mulai">Belum Mulai</option>
              <option value="dalam_pengerjaan">Dalam Pengerjaan</option>
              <option value="selesai">Selesai</option>
              <option value="tertunda">Tertunda</option>
            </select>
          </div>

          <!-- Module Reassignment (dropdown) -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-neutral-400">Pindahkan ke Modul</label>
            <select
              v-model="targetModuleId"
              :disabled="isReadMode"
              class="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:bg-neutral-950/40"
            >
              <option v-for="mod in projectModules" :key="mod.id" :value="mod.id">
                {{ mod.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Tab Bar (hanya saat edit/detail) -->
        <div v-if="isEdit" class="sticky -top-6 z-10 bg-neutral-900 flex items-center gap-1 border-b border-neutral-800 -mx-6 px-6 pt-3">
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer"
            :class="activeTab === 'logtask' ? 'text-emerald-400 border-emerald-500' : 'text-neutral-500 border-transparent hover:text-neutral-300'"
            @click="activeTab = 'logtask'"
          >
            <CheckSquare class="w-3.5 h-3.5" />
            Log Task
            <span
              v-if="taskProgress.total > 0"
              class="ml-0.5 px-1.5 py-0.5 text-[9px] rounded-full font-bold"
              :class="taskProgress.done === taskProgress.total ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : 'bg-neutral-800 text-neutral-400 border border-neutral-700/50'"
            >
              {{ taskProgress.done }}/{{ taskProgress.total }}
            </span>
          </button>
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer"
            :class="activeTab === 'detail' ? 'text-violet-400 border-violet-500' : 'text-neutral-500 border-transparent hover:text-neutral-300'"
            @click="activeTab = 'detail'"
          >
            <FileText class="w-3.5 h-3.5" />
            Detail
          </button>
        </div>

        <!-- Tab Content: Detail -->
        <div v-if="activeTab === 'detail' || !isEdit" class="space-y-1.5">
          <label v-if="!isEdit" class="text-xs font-semibold text-neutral-400">Deskripsi / Catatan Pekerjaan</label>
          <RichTextEditor v-model="description" :editable="!isReadMode" />
        </div>

        <!-- Tab Content: Log Task -->
        <TaskChecklist
          v-if="isEdit && activeTab === 'logtask'"
          :submodule-id="submodule.id"
          :readonly="isReadMode"
        />

        <!-- Footer / Actions -->
        <div class="sticky -bottom-6 z-10 bg-neutral-900 flex items-center justify-between pt-4 pb-6 border-t border-neutral-800/80 mt-6 -mx-6 px-6">
          <div>
            <button
              v-if="isEdit"
              type="button"
              @click="deleteSubmodule"
              class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 rounded-lg transition cursor-pointer"
            >
              <Trash2 class="w-3.5 h-3.5" />
              Hapus Submodul
            </button>
          </div>

          <div class="flex gap-2">
            <button
              type="button"
              @click="emit('close')"
              class="px-3.5 py-2 text-xs font-semibold text-neutral-400 hover:text-white border border-neutral-800 rounded-lg hover:bg-neutral-800/50 transition cursor-pointer"
            >
              {{ isReadMode ? 'Tutup' : 'Batal' }}
            </button>
            <button
              v-if="isReadMode"
              type="button"
              @click="isReadMode = false"
              class="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg shadow-md transition cursor-pointer"
            >
              Edit
            </button>
            <button
              v-else
              type="submit"
              :disabled="!name.trim()"
              class="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg shadow-md disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

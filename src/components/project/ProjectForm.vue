<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useWorkNoteStore } from '../../stores/workNoteStore'
import { X, Trash2 } from 'lucide-vue-next'
import RichTextEditor from '../editor/RichTextEditor.vue'
import DatePicker from 'primevue/datepicker'

const props = defineProps({
  workspaceId: {
    type: String,
    required: true
  },
  project: {
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

const isEdit = computed(() => !!props.project)

onMounted(() => {
  if (props.project) {
    name.value = props.project.name
    description.value = props.project.description || ''
    startDate.value = props.project.startDate || ''
    endDate.value = props.project.endDate || ''
    status.value = props.project.status || 'belum_mulai'
  }
})

const save = () => {
  if (!name.value.trim()) return

  const projectData = {
    workspaceId: props.workspaceId,
    name: name.value.trim(),
    description: description.value,
    startDate: startDate.value,
    endDate: endDate.value,
    status: status.value
  }

  if (isEdit.value) {
    store.updateProject(props.project.id, projectData)
  } else {
    store.addProject(projectData)
  }
  emit('saved')
}

const deleteProject = () => {
  if (confirm(`Apakah lo yakin ingin menghapus project "${props.project.name}"? Semua modul dan submodul di dalamnya akan ikut terhapus.`)) {
    store.deleteProject(props.project.id)
    emit('saved')
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')"></div>
      
      <!-- Modal Content -->
      <div class="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-350 z-10">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h3 class="text-sm font-semibold text-white">
            {{ isEdit ? 'Edit Project' : 'Tambah Project' }}
          </h3>
          <button @click="emit('close')" class="text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 rounded transition cursor-pointer">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="save" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <!-- Nama Project -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-neutral-400">Nama Project <span class="text-violet-400">*</span></label>
            <input
              v-model="name"
              type="text"
              required
              placeholder="Contoh: Migrasi Dashboard Admin"
              class="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 outline-none transition"
            />
          </div>

          <!-- Dates and Status Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              />
            </div>

            <!-- Status -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-neutral-400">Status</label>
              <select
                v-model="status"
                class="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none transition cursor-pointer"
              >
                <option value="belum_mulai">Belum Mulai</option>
                <option value="dalam_pengerjaan">Dalam Pengerjaan</option>
                <option value="selesai">Selesai</option>
                <option value="tertunda">Tertunda</option>
              </select>
            </div>
          </div>

          <!-- Description (RichTextEditor) -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-neutral-400">Deskripsi / Catatan Project</label>
            <RichTextEditor v-model="description" />
          </div>

          <!-- Footer / Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-neutral-800/80 mt-6">
            <div>
              <button
                v-if="isEdit"
                type="button"
                @click="deleteProject"
                class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 rounded-lg transition cursor-pointer"
              >
                <Trash2 class="w-3.5 h-3.5" />
                Hapus Project
              </button>
            </div>

            <div class="flex gap-2">
              <button
                type="button"
                @click="emit('close')"
                class="px-3.5 py-2 text-xs font-semibold text-neutral-400 hover:text-white border border-neutral-800 rounded-lg hover:bg-neutral-800/50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
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
  </Teleport>
</template>

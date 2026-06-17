<script setup>
import { ref, onMounted, computed } from 'vue'
import { useWorkNoteStore } from '../../stores/workNoteStore'
import { X, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  workspace: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const store = useWorkNoteStore()

const name = ref('')
const contractDuration = ref('')
const position = ref('')

const isEdit = computed(() => !!props.workspace)

onMounted(() => {
  if (props.workspace) {
    name.value = props.workspace.name
    contractDuration.value = props.workspace.contractDuration || ''
    position.value = props.workspace.position || ''
  }
})

const save = () => {
  if (!name.value.trim()) return

  if (isEdit.value) {
    store.updateWorkspace(props.workspace.id, {
      name: name.value.trim(),
      contractDuration: contractDuration.value.trim(),
      position: position.value.trim()
    })
  } else {
    store.addWorkspace({
      name: name.value.trim(),
      contractDuration: contractDuration.value.trim(),
      position: position.value.trim()
    })
  }
  emit('saved')
}

const deleteWorkspace = () => {
  if (confirm(`Apakah lo yakin ingin menghapus tempat kerja "${props.workspace.name}"? Semua project, modul, dan submodul di dalamnya akan ikut terhapus.`)) {
    store.deleteWorkspace(props.workspace.id)
    emit('saved')
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')"></div>
    
    <!-- Modal Content -->
    <div class="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-350 z-10">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <h3 class="text-sm font-semibold text-white">
          {{ isEdit ? 'Edit Tempat Kerja' : 'Tambah Tempat Kerja' }}
        </h3>
        <button @click="emit('close')" class="text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 rounded transition cursor-pointer">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="save" class="p-6 space-y-4">
        <!-- Nama -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-neutral-400">Nama Tempat Kerja <span class="text-violet-400">*</span></label>
          <input
            v-model="name"
            type="text"
            required
            placeholder="Contoh: PT. Abang Express"
            class="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 outline-none transition"
          />
        </div>

        <!-- Durasi Kontrak -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-neutral-400">Durasi Kontrak</label>
          <input
            v-model="contractDuration"
            type="text"
            placeholder="Contoh: 12 Bulan (Jan - Des 2026)"
            class="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 outline-none transition"
          />
        </div>

        <!-- Posisi Kerja -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-neutral-400">Posisi Kerja</label>
          <input
            v-model="position"
            type="text"
            placeholder="Contoh: Senior Frontend Developer"
            class="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 outline-none transition"
          />
        </div>

        <!-- Footer / Actions -->
        <div class="flex items-center justify-between pt-4 border-t border-neutral-800/80 mt-6">
          <div>
            <button
              v-if="isEdit"
              type="button"
              @click="deleteWorkspace"
              class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 rounded-lg transition cursor-pointer"
            >
              <Trash2 class="w-3.5 h-3.5" />
              Hapus
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
</template>

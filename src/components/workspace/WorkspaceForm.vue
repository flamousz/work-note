<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useWorkNoteStore } from '../../stores/workNoteStore'
import { X, Trash2 } from 'lucide-vue-next'
import DatePicker from 'primevue/datepicker'
import { differenceInDays } from 'date-fns'

const props = defineProps({
  workspace: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const store = useWorkNoteStore()

const name = ref('')
const contractType = ref('kontrak')
const startContract = ref('')
const endContract = ref('')
const position = ref('')

const startContractObj = computed({
  get: () => startContract.value ? new Date(startContract.value) : null,
  set: (val) => {
    if (val) {
      const year = val.getFullYear()
      const month = String(val.getMonth() + 1).padStart(2, '0')
      const day = String(val.getDate()).padStart(2, '0')
      startContract.value = `${year}-${month}-${day}`
    } else {
      startContract.value = ''
    }
  }
})

const endContractObj = computed({
  get: () => endContract.value ? new Date(endContract.value) : null,
  set: (val) => {
    if (val) {
      const year = val.getFullYear()
      const month = String(val.getMonth() + 1).padStart(2, '0')
      const day = String(val.getDate()).padStart(2, '0')
      endContract.value = `${year}-${month}-${day}`
    } else {
      endContract.value = ''
    }
  }
})

watch([startContract, endContract], ([newStart, newEnd]) => {
  if (newStart && newEnd && newEnd < newStart) {
    endContract.value = newStart
  }
})

watch(contractType, (newType) => {
  if (newType === 'tetap') {
    startContract.value = ''
    endContract.value = ''
  }
})

const isEdit = computed(() => !!props.workspace)

const calculatedDuration = computed(() => {
  if (!startContract.value || !endContract.value) return ''
  const start = new Date(startContract.value)
  const end = new Date(endContract.value)
  
  const totalDays = differenceInDays(end, start) + 1
  if (totalDays <= 0) return '0 Hari'
  
  const approximateMonths = totalDays / 30.4375
  const roundedMonths = Math.round(approximateMonths)
  
  if (roundedMonths >= 1) {
    const errorDays = Math.abs(totalDays - roundedMonths * 30.4375)
    if (errorDays < 3.5) {
      return `${roundedMonths} Bulan`
    }
    
    const months = Math.floor(totalDays / 30.4375)
    const remainingDays = Math.round(totalDays - (months * 30.4375))
    
    if (months > 0 && remainingDays > 0) {
      return `${months} Bulan ${remainingDays} Hari`
    } else if (months > 0) {
      return `${months} Bulan`
    }
  }
  
  return `${totalDays} Hari`
})

onMounted(() => {
  if (props.workspace) {
    name.value = props.workspace.name
    contractType.value = props.workspace.contractType || 'kontrak'
    position.value = props.workspace.position || ''
    startContract.value = props.workspace.startContract || ''
    endContract.value = props.workspace.endContract || ''
  }
})

const save = () => {
  if (!name.value.trim()) return

  const workspaceData = {
    name: name.value.trim(),
    contractType: contractType.value,
    position: position.value.trim(),
    startContract: contractType.value === 'tetap' ? '' : startContract.value,
    endContract: contractType.value === 'tetap' ? '' : endContract.value
  }

  if (isEdit.value) {
    store.updateWorkspace(props.workspace.id, workspaceData)
  } else {
    store.addWorkspace(workspaceData)
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
  <Teleport to="body">
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

          <!-- Jenis Kontrak -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-neutral-400">Jenis Kepegawaian</label>
            <div class="grid grid-cols-2 gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-850">
              <button
                type="button"
                @click="contractType = 'kontrak'"
                :class="contractType === 'kontrak' 
                  ? 'bg-gradient-to-r from-violet-600/90 to-indigo-600/90 text-white font-bold shadow-md shadow-violet-500/10' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'"
                class="w-full py-2.5 text-xs rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                Kontrak
              </button>
              <button
                type="button"
                @click="contractType = 'tetap'"
                :class="contractType === 'tetap' 
                  ? 'bg-gradient-to-r from-violet-600/90 to-indigo-600/90 text-white font-bold shadow-md shadow-violet-500/10' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'"
                class="w-full py-2.5 text-xs rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                Tetap
              </button>
            </div>
          </div>

          <!-- Periode & Durasi Kontrak (Conditional Transition) -->
          <Transition name="fade-slide">
            <div v-if="contractType === 'kontrak'" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <!-- Start Date -->
                <div class="space-y-1.5 flex flex-col">
                  <label class="text-xs font-semibold text-neutral-400">Mulai Kontrak</label>
                  <DatePicker
                    v-model="startContractObj"
                    dateFormat="dd M yy"
                    showIcon
                    iconDisplay="input"
                    placeholder="Mulai Kontrak"
                    class="w-full"
                  />
                </div>

                <!-- End Date -->
                <div class="space-y-1.5 flex flex-col">
                  <label class="text-xs font-semibold text-neutral-400">Selesai Kontrak</label>
                  <DatePicker
                    v-model="endContractObj"
                    dateFormat="dd M yy"
                    showIcon
                    iconDisplay="input"
                    placeholder="Selesai Kontrak"
                    class="w-full"
                  />
                </div>
              </div>

              <!-- Durasi Kontrak Terhitung -->
              <div v-if="calculatedDuration" class="text-xs bg-neutral-950/60 border border-neutral-850 rounded-lg p-3 flex justify-between items-center">
                <span class="text-neutral-400 font-semibold">Durasi Kontrak Terhitung:</span>
                <span class="text-violet-400 font-bold bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20">
                  {{ calculatedDuration }}
                </span>
              </div>
            </div>
          </Transition>

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
  </Teleport>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease-out;
  max-height: 250px;
  opacity: 1;
  overflow: hidden;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px);
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
</style>

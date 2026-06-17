<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkNoteStore } from '../../stores/workNoteStore'
import { ChevronRight, Calendar } from 'lucide-vue-next'
import { format } from 'date-fns'
import { id } from 'date-fns/locale' // Indonesian locale if wanted, or fallback to default

const store = useWorkNoteStore()
const route = useRoute()

const breadcrumbs = computed(() => {
  const list = [{ name: 'Dashboard', to: '/' }]
  
  if (route.params.workspaceId) {
    const ws = store.getWorkspaceById(route.params.workspaceId)
    if (ws) {
      const wsPath = `/workspace/${ws.id}`
      list.push({ name: ws.name, to: route.params.projectId ? wsPath : null })
      
      if (route.params.projectId) {
        const proj = store.getProjectById(route.params.projectId)
        if (proj) {
          list.push({ name: proj.name, to: null })
        }
      }
    }
  }
  
  return list
})

const currentDateString = computed(() => {
  try {
    return format(new Date(), 'EEEE, dd MMMM yyyy')
  } catch (e) {
    return new Date().toLocaleDateString()
  }
})
</script>

<template>
  <header class="h-14 border-b border-neutral-800 bg-neutral-950/40 backdrop-blur-md flex items-center justify-between px-6 select-none flex-shrink-0">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-1.5 text-xs text-neutral-400">
      <div v-for="(crumb, idx) in breadcrumbs" :key="idx" class="flex items-center gap-1.5">
        <router-link
          v-if="crumb.to"
          :to="crumb.to"
          class="hover:text-white transition-colors cursor-pointer"
        >
          {{ crumb.name }}
        </router-link>
        <span v-else class="text-neutral-200 font-medium truncate max-w-[180px]">{{ crumb.name }}</span>
        
        <ChevronRight v-if="idx < breadcrumbs.length - 1" class="w-3.5 h-3.5 text-neutral-600" />
      </div>
    </nav>

    <!-- Header Actions / Info -->
    <div class="flex items-center gap-4 text-xs text-neutral-400">
      <div class="flex items-center gap-2 bg-neutral-900/60 px-3 py-1.5 rounded-full border border-neutral-800/80">
        <Calendar class="w-3.5 h-3.5 text-violet-400" />
        <span class="font-medium text-neutral-300 text-[10px] sm:text-xs">{{ currentDateString }}</span>
      </div>
    </div>
  </header>
</template>

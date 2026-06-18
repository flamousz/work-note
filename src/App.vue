<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppHeader from './components/layout/AppHeader.vue'

const route = useRoute()
const router = useRouter()

const isBlankLayout = computed(() => route.meta.layout === 'blank')

// Responsive screen size check to handle live resize
const checkScreenSize = () => {
  const isMobile = window.innerWidth < 1024
  if (isMobile && route.name !== 'desktop-only') {
    router.push({ name: 'desktop-only', query: { redirect: route.fullPath } })
  } else if (!isMobile && route.name === 'desktop-only') {
    router.push(route.query.redirect || '/')
  }
}

onMounted(() => {
  window.addEventListener('resize', checkScreenSize)
  checkScreenSize()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
    <!-- Sidebar -->
    <AppSidebar v-if="!isBlankLayout" class="flex-shrink-0" />

    <!-- Main Container -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Header -->
      <AppHeader v-if="!isBlankLayout" />

      <!-- Main Content Area -->
      <main class="flex-1 overflow-y-auto bg-neutral-900/10">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style>
/* Page transition animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

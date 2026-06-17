<script setup>
import AppSidebar from './components/layout/AppSidebar.vue'
import AppHeader from './components/layout/AppHeader.vue'
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
    <!-- Sidebar -->
    <AppSidebar class="flex-shrink-0" />

    <!-- Main Container -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Header -->
      <AppHeader />

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

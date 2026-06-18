<template>
  <div
    class="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 relative overflow-hidden px-6"
  >
    <!-- Decorative background glow -->
    <div
      class="absolute w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    ></div>
    <div
      class="absolute w-[300px] h-[300px] rounded-full bg-cyan-600/10 blur-[100px] top-1/3 left-1/3 pointer-events-none"
    ></div>

    <div
      class="max-w-md w-full bg-neutral-900/50 backdrop-blur-xl border border-neutral-800/85 rounded-2xl p-8 text-center shadow-2xl relative z-10 flex flex-col items-center"
    >
      <!-- Animated Visual Representation -->
      <div class="relative w-36 h-36 mb-8 flex items-center justify-center">
        <!-- Monitor Frame -->
        <div
          class="absolute inset-0 border-2 border-neutral-700 rounded-xl bg-neutral-950 p-2 shadow-inner transition-transform duration-500 hover:scale-105"
        >
          <!-- Monitor Stand -->
          <div
            class="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-8 h-4 bg-neutral-700 rounded-t-sm"
          ></div>
          <div
            class="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-16 h-1 bg-neutral-600 rounded-full"
          ></div>
          <!-- Screen Content (Grid representation) -->
          <div
            class="w-full h-full rounded bg-neutral-900 flex flex-col gap-1.5 p-2"
          >
            <div class="h-3 w-1/2 bg-violet-500/30 rounded"></div>
            <div class="flex gap-1.5 flex-1">
              <div class="w-1/4 bg-neutral-800 rounded"></div>
              <div class="w-3/4 bg-neutral-800 rounded flex flex-col gap-1 p-1">
                <div class="h-1 w-full bg-neutral-700 rounded"></div>
                <div class="h-1 w-2/3 bg-neutral-700 rounded"></div>
              </div>
            </div>
            <div class="h-2 w-full bg-neutral-800 rounded"></div>
          </div>
        </div>

        <!-- Floating Warning Indicator -->
        <div
          class="absolute -top-2 -right-2 bg-linear-to-tr from-amber-500 to-orange-400 p-2.5 rounded-full shadow-lg border-2 border-neutral-950 animate-bounce"
        >
          <Monitor class="w-5 h-5 text-neutral-950" />
        </div>
      </div>

      <h1 class="text-2xl font-bold tracking-tight text-white mb-3">
        Optimalkan untuk Desktop
      </h1>

      <p class="text-neutral-400 text-sm leading-relaxed mb-8">
        Aplikasi Work Note saat ini hanya didesain untuk layar desktop (lebar
        minimal <span class="text-violet-400 font-semibold">1024px</span>).
        Silakan gunakan laptop/komputer atau perbesar ukuran jendela browser
        Anda.
      </p>

      <!-- Live Width Indicator -->
      <div
        class="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 mb-2 flex flex-col items-center"
      >
        <span
          class="text-xs text-neutral-500 uppercase tracking-widest font-semibold mb-1"
          >Lebar Layar Sekarang</span
        >
        <div class="flex items-baseline gap-1.5">
          <span
            class="text-3xl font-black font-mono tracking-tight"
            :class="widthColorClass"
          >
            {{ screenWidth }}px
          </span>
          <span class="text-xs text-neutral-500">/ 1024px</span>
        </div>

        <!-- Progress Bar -->
        <div
          class="w-full bg-neutral-900 h-1.5 rounded-full mt-3 overflow-hidden"
        >
          <div
            class="h-full transition-all duration-300 ease-out"
            :class="progressBarClass"
            :style="{ width: `${Math.min(100, (screenWidth / 1024) * 100)}%` }"
          ></div>
        </div>
      </div>

      <!-- Responsive advice prompt -->
      <div class="text-[11px] text-neutral-500 mt-2 flex items-center gap-1.5">
        <span
          class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"
        ></span>
        Halaman akan otomatis dimuat ulang jika Anda memperbesar layar.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { Monitor } from "lucide-vue-next";

const screenWidth = ref(window.innerWidth);

const updateWidth = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener("resize", updateWidth);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateWidth);
});

const widthColorClass = computed(() => {
  if (screenWidth.value < 640) return "text-red-400";
  if (screenWidth.value < 1024) return "text-amber-400";
  return "text-emerald-400";
});

const progressBarClass = computed(() => {
  if (screenWidth.value < 640) return "bg-red-500";
  if (screenWidth.value < 1024) return "bg-amber-500";
  return "bg-emerald-500";
});
</script>

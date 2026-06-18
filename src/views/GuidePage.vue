<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboarding } from '../composables/useOnboarding'
import {
  Briefcase,
  FolderKanban,
  ClipboardList,
  Layers,
  ArrowRight,
  ArrowDown,
  Rocket,
  GripVertical,
  FileText,
  HardDrive,
  Moon,
  Sparkles,
  BookOpen,
  Play,
  ChevronRight,
  Compass,
  Route,
} from 'lucide-vue-next'

const router = useRouter()
const { startDashboardTour, startCreationFlowTour } = useOnboarding()

const isStartingTour = ref(false)
const isStartingCreation = ref(false)

const startInteractiveTour = async () => {
  isStartingTour.value = true
  await router.push('/')

  // Small delay so Dashboard DOM renders before tour starts
  setTimeout(() => {
    startDashboardTour()
    isStartingTour.value = false
  }, 500)
}

const goToDashboard = () => {
  router.push('/')
}

const startCreationTour = async () => {
  isStartingCreation.value = true
  await startCreationFlowTour()
  isStartingCreation.value = false
}

// Hierarchy concept cards
const hierarchyCards = [
  {
    icon: Briefcase,
    title: 'Tempat Kerja',
    description: 'Representasi dari perusahaan atau tempat kamu bekerja. Isi nama, posisi, dan durasi kontrak.',
    color: 'violet',
    step: 1,
  },
  {
    icon: FolderKanban,
    title: 'Project',
    description: 'Setiap project yang kamu kerjakan di tempat kerja tersebut. Lengkap dengan tanggal dan status.',
    color: 'indigo',
    step: 2,
  },
  {
    icon: ClipboardList,
    title: 'Modul Kerjaan',
    description: 'Pembagian kerja dalam project, ditampilkan sebagai kolom Kanban yang bisa di-drag & drop.',
    color: 'blue',
    step: 3,
  },
  {
    icon: Layers,
    title: 'Submodul Kerjaan',
    description: 'Detail tugas terkecil di setiap modul. Bisa dipindahkan antar modul dengan drag & drop.',
    color: 'cyan',
    step: 4,
  },
]

// Usage steps data
const usageSteps = [
  {
    number: '01',
    title: 'Buat Tempat Kerja',
    description: 'Mulai dengan membuat Tempat Kerja baru. Isi nama perusahaan, posisi kerja kamu, dan durasi kontrak. Ini adalah level tertinggi dalam hierarki Work Note.',
    hint: 'Klik tombol "Tambah Baru" di Dashboard atau ikon "+" di sidebar',
  },
  {
    number: '02',
    title: 'Tambahkan Project',
    description: 'Di dalam Tempat Kerja, buat Project yang sedang kamu kerjakan. Berikan nama, deskripsi, tanggal mulai & berakhir, serta status progress-nya.',
    hint: 'Masuk ke Workspace → Klik "Tambah Project"',
  },
  {
    number: '03',
    title: 'Buat Modul Kerjaan',
    description: 'Bagi project menjadi Modul-modul. Setiap modul menjadi kolom Kanban terpisah. Kamu bisa mengatur urutannya dengan drag & drop.',
    hint: 'Di halaman Project → Klik "Tambah Modul"',
  },
  {
    number: '04',
    title: 'Isi Submodul',
    description: 'Tambahkan detail tugas sebagai Submodul di dalam setiap Modul. Setiap submodul punya nama, deskripsi (rich text), tanggal, dan status.',
    hint: 'Di bawah kolom Modul → Klik "Tambah Submodul"',
  },
  {
    number: '05',
    title: 'Atur dengan Drag & Drop',
    description: 'Susun ulang modul dan submodul sesuka hati. Pindahkan submodul antar modul dengan menarik kartu ke kolom lain — seperti Kanban board profesional.',
    hint: 'Tarik handle ⠿ pada modul atau kartu submodul',
  },
]

// Feature tips
const featureTips = [
  {
    icon: GripVertical,
    title: 'Drag & Drop',
    description: 'Pindahkan submodul antar modul dan atur ulang urutan dengan drag & drop intuitif.',
  },
  {
    icon: FileText,
    title: 'Rich Text Editor',
    description: 'Tulis deskripsi dengan format — heading, bold, italic, list, code block, dan lainnya.',
  },
  {
    icon: HardDrive,
    title: 'Tersimpan di Browser',
    description: 'Semua data tersimpan aman di LocalStorage browser kamu. Tanpa server, tanpa login.',
  },
  {
    icon: Moon,
    title: 'Dark Mode',
    description: 'Tampilan gelap yang nyaman untuk mata, dengan aksen warna violet premium.',
  },
]
</script>

<template>
  <div class="min-h-full animate-fade-in">
    <!-- HERO SECTION -->
    <section class="relative px-8 pt-12 pb-16 overflow-hidden">
      <!-- Background decorations -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-violet-600/5 rounded-full blur-[120px]"></div>
        <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px]"></div>
      </div>

      <div class="relative z-10 max-w-3xl mx-auto text-center space-y-6">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-950/50 border border-violet-800/40 rounded-full">
          <Sparkles class="w-3.5 h-3.5 text-violet-400" />
          <span class="text-[11px] font-bold text-violet-300 uppercase tracking-widest">Panduan Pengguna</span>
        </div>

        <!-- Headline -->
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Selamat Datang di <br />
          <span class="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Work Note
          </span>
        </h1>

        <p class="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-xl mx-auto">
          Sistem logging pekerjaan terstruktur untuk melacak semua progress kerja kamu —
          dari tempat kerja, project, modul, hingga submodul — langsung di browser.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            @click="startInteractiveTour"
            :disabled="isStartingTour"
            class="group flex items-center gap-2.5 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            <Play class="w-4 h-4" />
            <span>{{ isStartingTour ? 'Memuat...' : 'Mulai Tur Interaktif' }}</span>
            <ChevronRight class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            @click="goToDashboard"
            class="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-neutral-300 hover:text-white bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 rounded-xl transition-all cursor-pointer"
          >
            <Rocket class="w-4 h-4" />
            Langsung Mulai
          </button>
        </div>
      </div>
    </section>

    <!-- ONBOARDING TOURS SECTION -->
    <section class="px-8 py-12 max-w-4xl mx-auto">
      <div class="text-center mb-10 space-y-2">
        <h2 class="text-xl sm:text-2xl font-bold text-white">Tur Interaktif</h2>
        <p class="text-xs sm:text-sm text-neutral-500">Pilih panduan interaktif untuk mempelajari Work Note secara langsung</p>
      </div>

      <div class="space-y-4">
        <!-- Tour 1: Dashboard Introduction -->
        <div class="group bg-neutral-900/40 border border-neutral-800 hover:border-violet-800/30 rounded-xl p-6 transition-all duration-300">
          <div class="flex flex-col sm:flex-row sm:items-center gap-5">
            <!-- Icon -->
            <div class="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-600/15 to-indigo-600/10 border border-violet-900/30 flex items-center justify-center flex-shrink-0">
              <Compass class="w-7 h-7 text-violet-400" />
            </div>

            <!-- Content -->
            <div class="flex-1 space-y-2.5 min-w-0">
              <div class="flex flex-wrap items-center gap-2.5">
                <h3 class="text-sm font-bold text-white">Mengenal Dashboard</h3>
                <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">Pemula</span>
              </div>
              <p class="text-xs text-neutral-400 leading-relaxed">
                Kenali tampilan utama Work Note, navigasi sidebar, dan fungsi tombol-tombol penting di halaman Dashboard.
              </p>
              <div class="flex items-center gap-4 text-[10px] text-neutral-500 font-medium">
                <span class="flex items-center gap-1">📊 6 langkah</span>
                <span class="flex items-center gap-1">⏱ ~1 menit</span>
              </div>
            </div>

            <!-- Action -->
            <button
              @click="startInteractiveTour"
              :disabled="isStartingTour"
              class="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg shadow-md shadow-violet-500/10 transition-all cursor-pointer flex-shrink-0 disabled:opacity-50"
            >
              <Play class="w-3.5 h-3.5" />
              {{ isStartingTour ? 'Memuat...' : 'Mulai Tur' }}
            </button>
          </div>
        </div>

        <!-- Tour 2: Full Creation Flow -->
        <div class="group bg-neutral-900/40 border border-neutral-800 hover:border-blue-800/30 rounded-xl p-6 transition-all duration-300">
          <div class="flex flex-col sm:flex-row sm:items-start gap-5">
            <!-- Icon -->
            <div class="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600/15 to-cyan-600/10 border border-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Route class="w-7 h-7 text-blue-400" />
            </div>

            <!-- Content -->
            <div class="flex-1 space-y-2.5 min-w-0">
              <div class="flex flex-wrap items-center gap-2.5">
                <h3 class="text-sm font-bold text-white">Alur Pembuatan Lengkap</h3>
                <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-950/40 text-blue-400 border border-blue-900/30">Multi-Halaman</span>
              </div>
              <p class="text-xs text-neutral-400 leading-relaxed">
                Panduan interaktif yang membawa kamu menelusuri seluruh alur pembuatan — dari Tempat Kerja hingga Submodul.
              </p>

              <!-- Flow path chips -->
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="text-[9px] px-2 py-0.5 bg-violet-950/30 text-violet-400 rounded border border-violet-900/20 font-medium">Tempat Kerja</span>
                <ChevronRight class="w-3 h-3 text-neutral-600" />
                <span class="text-[9px] px-2 py-0.5 bg-indigo-950/30 text-indigo-400 rounded border border-indigo-900/20 font-medium">Project</span>
                <ChevronRight class="w-3 h-3 text-neutral-600" />
                <span class="text-[9px] px-2 py-0.5 bg-blue-950/30 text-blue-400 rounded border border-blue-900/20 font-medium">Modul</span>
                <ChevronRight class="w-3 h-3 text-neutral-600" />
                <span class="text-[9px] px-2 py-0.5 bg-cyan-950/30 text-cyan-400 rounded border border-cyan-900/20 font-medium">Submodul</span>
              </div>

              <div class="flex items-center gap-4 text-[10px] text-neutral-500 font-medium">
                <span class="flex items-center gap-1">📊 7-9 langkah</span>
                <span class="flex items-center gap-1">⏱ ~3 menit</span>
                <span class="flex items-center gap-1">🗺 3 halaman</span>
              </div>
            </div>

            <!-- Action -->
            <button
              @click="startCreationTour"
              :disabled="isStartingCreation"
              class="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg shadow-md shadow-blue-500/10 transition-all cursor-pointer flex-shrink-0 disabled:opacity-50 mt-2 sm:mt-0"
            >
              <Play class="w-3.5 h-3.5" />
              {{ isStartingCreation ? 'Memuat...' : 'Mulai Tur' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- HIERARCHY CONCEPT SECTION -->
    <section class="px-8 py-12 max-w-5xl mx-auto">
      <div class="text-center mb-10 space-y-2">
        <h2 class="text-xl sm:text-2xl font-bold text-white">Konsep Dasar</h2>
        <p class="text-xs sm:text-sm text-neutral-500">Work Note menggunakan 4 level hierarki untuk mengorganisir pekerjaan kamu</p>
      </div>

      <!-- Hierarchy Flow Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          v-for="(card, idx) in hierarchyCards"
          :key="card.title"
          class="relative group"
        >
          <!-- Card -->
          <div class="bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700/60 rounded-xl p-5 space-y-4 hover:bg-neutral-900/70 transition-all duration-300 h-full flex flex-col">
            <!-- Step number -->
            <div class="flex items-center justify-between">
              <div
                class="h-10 w-10 rounded-lg flex items-center justify-center border flex-shrink-0"
                :class="{
                  'bg-violet-600/10 text-violet-400 border-violet-900/30': card.color === 'violet',
                  'bg-indigo-600/10 text-indigo-400 border-indigo-900/30': card.color === 'indigo',
                  'bg-blue-600/10 text-blue-400 border-blue-900/30': card.color === 'blue',
                  'bg-cyan-600/10 text-cyan-400 border-cyan-900/30': card.color === 'cyan',
                }"
              >
                <component :is="card.icon" class="w-5 h-5" />
              </div>
              <span
                class="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full border"
                :class="{
                  'text-violet-400 bg-violet-950/40 border-violet-900/30': card.color === 'violet',
                  'text-indigo-400 bg-indigo-950/40 border-indigo-900/30': card.color === 'indigo',
                  'text-blue-400 bg-blue-950/40 border-blue-900/30': card.color === 'blue',
                  'text-cyan-400 bg-cyan-950/40 border-cyan-900/30': card.color === 'cyan',
                }"
              >
                Level {{ card.step }}
              </span>
            </div>

            <!-- Content -->
            <div class="space-y-1.5 flex-1">
              <h3 class="text-sm font-bold text-neutral-100 group-hover:text-white transition-colors">
                {{ card.title }}
              </h3>
              <p class="text-xs text-neutral-400 leading-relaxed">
                {{ card.description }}
              </p>
            </div>

            <!-- Placeholder for future illustration -->
            <!-- Replace this div with <img> when illustrations are ready -->
            <div class="guide-illustration-slot" :data-level="card.step">
              <!-- Future: <img :src="card.illustration" :alt="card.title" class="w-full rounded-lg" /> -->
            </div>
          </div>

          <!-- Arrow connector (visible between cards on lg) -->
          <div
            v-if="idx < hierarchyCards.length - 1"
            class="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 text-neutral-700"
          >
            <ArrowRight class="w-5 h-5" />
          </div>
          <!-- Arrow connector (visible between cards on mobile) -->
          <div
            v-if="idx < hierarchyCards.length - 1"
            class="lg:hidden flex justify-center py-2 text-neutral-700"
          >
            <ArrowDown class="w-5 h-5" />
          </div>
        </div>
      </div>
    </section>

    <!-- STEP-BY-STEP USAGE SECTION -->
    <section class="px-8 py-12 max-w-4xl mx-auto">
      <div class="text-center mb-10 space-y-2">
        <h2 class="text-xl sm:text-2xl font-bold text-white">Cara Penggunaan</h2>
        <p class="text-xs sm:text-sm text-neutral-500">Ikuti 5 langkah sederhana ini untuk mulai mengorganisir pekerjaan</p>
      </div>

      <div class="space-y-4">
        <div
          v-for="step in usageSteps"
          :key="step.number"
          class="group flex gap-5 p-5 bg-neutral-900/30 border border-neutral-850 hover:border-neutral-700/50 rounded-xl hover:bg-neutral-900/50 transition-all duration-300"
        >
          <!-- Step Number -->
          <div class="flex-shrink-0">
            <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-900/30 flex items-center justify-center">
              <span class="text-lg font-extrabold bg-gradient-to-br from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                {{ step.number }}
              </span>
            </div>
          </div>

          <!-- Step Content -->
          <div class="space-y-2 min-w-0">
            <h3 class="text-sm font-bold text-neutral-100 group-hover:text-white transition-colors">
              {{ step.title }}
            </h3>
            <p class="text-xs text-neutral-400 leading-relaxed">
              {{ step.description }}
            </p>

            <!-- Hint badge -->
            <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-950/30 border border-violet-900/25 rounded-lg mt-1">
              <BookOpen class="w-3 h-3 text-violet-400 flex-shrink-0" />
              <span class="text-[10px] text-violet-300 font-medium">{{ step.hint }}</span>
            </div>

            <!-- Placeholder for future step screenshot -->
            <!-- Replace this div with <img> when screenshots are ready -->
            <div class="guide-illustration-slot" :data-step="step.number">
              <!-- Future: <img :src="step.screenshot" :alt="step.title" class="w-full rounded-lg mt-3" /> -->
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURE TIPS SECTION -->
    <section class="px-8 py-12 max-w-5xl mx-auto">
      <div class="text-center mb-10 space-y-2">
        <h2 class="text-xl sm:text-2xl font-bold text-white">Tips & Fitur Unggulan</h2>
        <p class="text-xs sm:text-sm text-neutral-500">Fitur-fitur yang membuat Work Note makin powerful</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div
          v-for="tip in featureTips"
          :key="tip.title"
          class="flex items-start gap-4 p-5 bg-neutral-900/40 border border-neutral-850 hover:border-neutral-700/50 rounded-xl hover:bg-neutral-900/60 transition-all duration-300"
        >
          <div class="h-10 w-10 rounded-lg bg-violet-600/10 border border-violet-900/30 flex items-center justify-center text-violet-400 flex-shrink-0">
            <component :is="tip.icon" class="w-5 h-5" />
          </div>
          <div class="space-y-1">
            <h4 class="text-sm font-bold text-neutral-100">{{ tip.title }}</h4>
            <p class="text-xs text-neutral-400 leading-relaxed">{{ tip.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA FOOTER SECTION -->
    <section class="px-8 py-16 max-w-3xl mx-auto text-center space-y-6">
      <div class="p-8 bg-gradient-to-r from-violet-950/30 via-indigo-950/20 to-neutral-950/30 border border-violet-900/25 rounded-2xl space-y-5">
        <h2 class="text-lg sm:text-xl font-bold text-white">Siap Mencoba?</h2>
        <p class="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
          Mulai tur interaktif untuk melihat langsung cara kerja Work Note, atau langsung buat Tempat Kerja pertama kamu.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            @click="startInteractiveTour"
            :disabled="isStartingTour"
            class="group flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Play class="w-3.5 h-3.5" />
            {{ isStartingTour ? 'Memuat...' : 'Mulai Tur Interaktif' }}
          </button>

          <button
            @click="goToDashboard"
            class="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg transition-all cursor-pointer"
          >
            <Rocket class="w-3.5 h-3.5" />
            Langsung ke Dashboard
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

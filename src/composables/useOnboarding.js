import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useWorkNoteStore } from '../stores/workNoteStore'

const TOUR_COMPLETED_KEY = 'wn_tour_completed'
const TOUR_VERSION = '1'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** Base configuration shared across all tour phases */
const baseDriverConfig = {
  showProgress: true,
  animate: true,
  overlayColor: 'rgba(0, 0, 0, 0.75)',
  stagePadding: 8,
  stageRadius: 12,
  popoverClass: 'wn-tour-popover',
  nextBtnText: 'Lanjut →',
  prevBtnText: '← Kembali',
  doneBtnText: 'Selesai ✓',
  progressText: '{{current}} dari {{total}}',
}

/**
 * Runs a single phase of a Driver.js tour.
 * Returns a promise: 'completed' when all steps done, 'closed' when user exits early.
 */
function runPhase(phaseConfig) {
  return new Promise((resolve) => {
    const driverObj = driver({
      ...baseDriverConfig,
      ...phaseConfig,
      onDestroyStarted: () => {
        if (!driverObj.hasNextStep()) {
          driverObj.destroy()
          resolve('completed')
        } else {
          driverObj.destroy()
          resolve('closed')
        }
      },
    })
    driverObj.drive()
  })
}

export function useOnboarding() {
  const router = useRouter()
  const store = useWorkNoteStore()

  const hasCompletedTour = ref(
    localStorage.getItem(TOUR_COMPLETED_KEY) === TOUR_VERSION
  )

  const markTourCompleted = () => {
    localStorage.setItem(TOUR_COMPLETED_KEY, TOUR_VERSION)
    hasCompletedTour.value = true
  }

  const resetTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY)
    hasCompletedTour.value = false
  }

  /* ═══════════════════════════════════════════
     TOUR 1: Dashboard Introduction
     ═══════════════════════════════════════════ */
  const dashboardSteps = [
    {
      element: '#sidebar-brand',
      popover: {
        title: '👋 Selamat Datang di Work Note!',
        description: 'Work Note adalah sistem logging pekerjaan yang membantu kamu melacak progress kerja secara terstruktur — dari Tempat Kerja, Project, hingga Modul dan Submodul.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '#sidebar-dashboard-link',
      popover: {
        title: '📊 Dashboard',
        description: 'Halaman utama yang menampilkan semua Tempat Kerja yang kamu miliki. Dari sini kamu bisa memantau dan mengakses setiap workspace.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '#sidebar-add-workspace-btn',
      popover: {
        title: '➕ Tambah Tempat Kerja',
        description: 'Klik tombol ini kapan saja untuk menambah Tempat Kerja baru langsung dari sidebar.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '#dashboard-hero',
      popover: {
        title: '🎯 Area Utama',
        description: 'Banner ini menampilkan ringkasan singkat tentang Work Note. Di bawahnya kamu akan menemukan daftar semua workspace.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '#dashboard-workspace-section',
      popover: {
        title: '🏢 Daftar Tempat Kerja',
        description: 'Semua Tempat Kerja yang sudah kamu buat akan muncul di sini sebagai kartu. Klik "Masuk Workspace" untuk melihat project di dalamnya.',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '#dashboard-add-workspace-btn',
      popover: {
        title: '🚀 Mulai Sekarang!',
        description: 'Langkah pertama kamu: buat Tempat Kerja baru! Isi nama perusahaan, posisi kerja, dan durasi kontrak kamu.',
        side: 'left',
        align: 'start',
      },
    },
  ]

  const startDashboardTour = () => {
    const driverObj = driver({
      ...baseDriverConfig,
      steps: dashboardSteps,
      onDestroyStarted: () => {
        markTourCompleted()
        driverObj.destroy()
      },
    })
    driverObj.drive()
    return driverObj
  }

  /* ═══════════════════════════════════════════
     TOUR 2: Full Creation Flow (Multi-Page)
     Tempat Kerja → Project → Modul → Submodul
     ═══════════════════════════════════════════ */
  const startCreationFlowTour = async () => {
    const workspaces = store.workspaces
    const firstWs = workspaces.length > 0 ? workspaces[0] : null

    // ─── Phase 1: Dashboard ───
    await router.push('/')
    await sleep(500)

    const phase1Result = await runPhase({
      doneBtnText: firstWs ? 'Ke Workspace →' : 'Selesai ✓',
      steps: [
        {
          element: '#dashboard-hero',
          popover: {
            title: '📍 Ini Dashboard Kamu',
            description: 'Halaman utama Work Note. Dari sini kamu bisa melihat dan mengelola semua Tempat Kerja.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '#dashboard-add-workspace-btn',
          popover: {
            title: '🏢 Langkah 1: Buat Tempat Kerja',
            description: firstWs
              ? `Bagus! Kamu sudah punya Tempat Kerja "${firstWs.name}". Kita akan masuk ke dalamnya.`
              : 'Klik tombol ini untuk membuat Tempat Kerja pertama. Isi nama perusahaan, posisi, dan durasi kontrak kamu.',
            side: 'left',
            align: 'start',
          },
        },
      ],
    })

    if (phase1Result === 'closed') return
    if (!firstWs) {
      markTourCompleted()
      return
    }

    // ─── Phase 2: Workspace Detail ───
    await router.push(`/workspace/${firstWs.id}`)
    await sleep(500)

    const projects = store.getProjectsByWorkspace(firstWs.id)
    const firstProject = projects.length > 0 ? projects[0] : null

    const phase2Result = await runPhase({
      doneBtnText: firstProject ? 'Ke Project →' : 'Selesai ✓',
      steps: [
        {
          element: '#workspace-metadata',
          popover: {
            title: '📋 Info Tempat Kerja',
            description: 'Di sini kamu bisa melihat detail posisi kerja dan durasi kontrak. Klik tombol edit (✏️) untuk mengubahnya.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '#workspace-projects-section',
          popover: {
            title: '📂 Daftar Project',
            description: firstProject
              ? `Kamu sudah punya Project "${firstProject.name}". Setiap project mewakili satu kerjaan yang sedang kamu tangani.`
              : 'Di sini akan tampil semua Project yang kamu buat. Setiap kartu project menampilkan nama, status, dan jadwal.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '#workspace-add-project-btn',
          popover: {
            title: '📂 Langkah 2: Buat Project',
            description: firstProject
              ? 'Kamu sudah punya Project! Selanjutnya kita masuk ke halaman Project untuk melihat Modul Kerjaan.'
              : 'Klik untuk membuat Project baru. Berikan nama, deskripsi (opsional), tanggal mulai/akhir, dan status progress.',
            side: 'left',
            align: 'start',
          },
        },
      ],
    })

    if (phase2Result === 'closed') return
    if (!firstProject) {
      markTourCompleted()
      return
    }

    // ─── Phase 3: Project Detail (Kanban) ───
    await router.push(`/workspace/${firstWs.id}/project/${firstProject.id}`)
    await sleep(500)

    const modules = store.getModulesByProject(firstProject.id)
    const hasModules = modules.length > 0

    const phase3Steps = [
      {
        element: '#project-add-module-btn',
        popover: {
          title: '📋 Langkah 3: Buat Modul',
          description: hasModules
            ? 'Kamu sudah punya Modul! Modul ditampilkan sebagai kolom Kanban yang bisa diatur urutannya dengan drag & drop.'
            : 'Klik untuk membuat Modul Kerjaan baru. Modul akan menjadi kolom pada Kanban board di bawah.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '#project-kanban',
        popover: {
          title: '🎯 Kanban Board',
          description: hasModules
            ? 'Ini adalah Kanban Board kamu! Setiap kolom mewakili satu Modul. Drag kolom untuk mengatur urutannya.'
            : 'Area ini akan menampilkan Modul-modul kamu sebagai kolom Kanban setelah dibuat.',
          side: 'top',
          align: 'center',
        },
      },
    ]

    if (hasModules) {
      phase3Steps.push({
        element: '.module-add-submodule-btn',
        popover: {
          title: '✅ Langkah 4: Tambah Submodul',
          description: 'Langkah terakhir! Tambahkan Submodul ke dalam Modul. Submodul adalah unit kerja terkecil — lengkap dengan status, tanggal, dan catatan (rich text).',
          side: 'top',
          align: 'center',
        },
      })
    }

    await runPhase({
      steps: phase3Steps,
      doneBtnText: 'Selesai ✓',
    })

    markTourCompleted()
  }

  return {
    hasCompletedTour,
    startDashboardTour,
    startCreationFlowTour,
    resetTour,
    markTourCompleted,
  }
}

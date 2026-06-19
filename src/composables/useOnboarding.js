import { ref } from "vue";
import { useRouter } from "vue-router";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useWorkNoteStore } from "../stores/workNoteStore";

const TOUR_COMPLETED_KEY = "wn_tour_completed";
const TOUR_VERSION = "1";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Base configuration shared across all tour phases */
const baseDriverConfig = {
  showProgress: true,
  animate: true,
  overlayColor: "rgba(0, 0, 0, 0.75)",
  stagePadding: 8,
  stageRadius: 12,
  popoverClass: "wn-tour-popover",
  nextBtnText: "Lanjut →",
  prevBtnText: "← Kembali",
  doneBtnText: "Selesai ✓",
  progressText: "{{current}} dari {{total}}",
};

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
          driverObj.destroy();
          resolve("completed");
        } else {
          driverObj.destroy();
          resolve("closed");
        }
      },
    });
    driverObj.drive();
  });
}

export function useOnboarding() {
  const router = useRouter();
  const store = useWorkNoteStore();

  const hasCompletedTour = ref(
    localStorage.getItem(TOUR_COMPLETED_KEY) === TOUR_VERSION,
  );

  const markTourCompleted = () => {
    localStorage.setItem(TOUR_COMPLETED_KEY, TOUR_VERSION);
    hasCompletedTour.value = true;
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    hasCompletedTour.value = false;
  };

  /* ═══════════════════════════════════════════
     TOUR 1: Dashboard Introduction
     ═══════════════════════════════════════════ */
  const dashboardSteps = [
    {
      element: "#sidebar-brand",
      popover: {
        title: "👋 Selamat Datang di Work Note!",
        description:
          "Work Note adalah sistem logging pekerjaan yang membantu kamu melacak progress kerja secara terstruktur — dari Tempat Kerja, Project, hingga Modul dan Submodul.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#sidebar-dashboard-link",
      popover: {
        title: "📊 Dashboard",
        description:
          "Halaman utama yang menampilkan semua Tempat Kerja yang kamu miliki. Dari sini kamu bisa memantau dan mengakses setiap workspace.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#sidebar-add-workspace-btn",
      popover: {
        title: "➕ Tambah Tempat Kerja",
        description:
          "Klik tombol ini kapan saja untuk menambah Tempat Kerja baru langsung dari sidebar.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#dashboard-hero",
      popover: {
        title: "🎯 Area Utama",
        description:
          "Banner ini menampilkan ringkasan singkat tentang Work Note. Di bawahnya kamu akan menemukan daftar semua workspace.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "#dashboard-workspace-section",
      popover: {
        title: "🏢 Daftar Tempat Kerja",
        description:
          'Semua Tempat Kerja yang sudah kamu buat akan muncul di sini sebagai kartu. Klik "Masuk Workspace" untuk melihat project di dalamnya.',
        side: "top",
        align: "center",
      },
    },
    {
      element: "#dashboard-add-workspace-btn",
      popover: {
        title: "🚀 Mulai Sekarang!",
        description:
          "Langkah pertama kamu: buat Tempat Kerja baru! Isi nama perusahaan, posisi kerja, dan durasi kontrak kamu.",
        side: "left",
        align: "start",
      },
    },
  ];

  const startDashboardTour = () => {
    const driverObj = driver({
      ...baseDriverConfig,
      steps: dashboardSteps,
      onDestroyStarted: () => {
        markTourCompleted();
        driverObj.destroy();
      },
    });
    driverObj.drive();
    return driverObj;
  };

  /* ═══════════════════════════════════════════
     TOUR 2: Full Creation Flow (Multi-Page)
     Tempat Kerja → Project → Modul → Submodul
     Uses isolated demo data that is auto-cleaned
     ═══════════════════════════════════════════ */
  const startCreationFlowTour = async () => {
    // Seed demo data — guaranteed to have data for all phases
    const { demoWsId, demoProjId } = store.seedDemoData();

    /** Helper: cleanup demo data and optionally mark tour completed */
    const cleanup = (complete = false) => {
      store.cleanupDemoData();
      if (complete) markTourCompleted();
      router.push("/");
    };

    // ─── Phase 1: Dashboard ───
    await router.push("/");
    await sleep(500);

    const phase1Result = await runPhase({
      doneBtnText: "Ke Workspace →",
      steps: [
        {
          element: "#dashboard-hero",
          popover: {
            title: "📍 Ini Dashboard Kamu",
            description:
              "Halaman utama Work Note. Di sini kamu bisa melihat dan mengelola semua Tempat Kerja yang kamu miliki.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#dashboard-workspace-section",
          popover: {
            title: "🏢 Daftar Tempat Kerja",
            description:
              "Kami sudah menyiapkan contoh Tempat Kerja untuk tur ini. Di sini semua workspace kamu akan muncul sebagai kartu.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#dashboard-add-workspace-btn",
          popover: {
            title: "➕ Langkah 1: Buat Tempat Kerja",
            description:
              "Setelah tur selesai, klik tombol ini untuk membuat Tempat Kerja kamu sendiri! Isi nama perusahaan, posisi, dan durasi kontrak.",
            side: "left",
            align: "start",
          },
        },
      ],
    });

    if (phase1Result === "closed") {
      cleanup();
      return;
    }

    // ─── Phase 2: Workspace Detail ───
    await router.push(`/workspace/${demoWsId}`);
    await sleep(500);

    const phase2Result = await runPhase({
      doneBtnText: "Ke Project →",
      steps: [
        {
          element: "#workspace-metadata",
          popover: {
            title: "📋 Info Tempat Kerja",
            description:
              "Di sini kamu bisa melihat detail posisi kerja dan durasi kontrak. Klik tombol edit (✏️) untuk mengubahnya kapan saja.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#workspace-projects-section",
          popover: {
            title: "📂 Daftar Project",
            description:
              "Setiap kartu project menampilkan nama, status, dan jadwal. Ini contoh project yang kami siapkan untuk tur.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#workspace-add-project-btn",
          popover: {
            title: "📂 Langkah 2: Buat Project",
            description:
              "Setelah tur, klik tombol ini untuk membuat Project kamu sendiri. Berikan nama, deskripsi, tanggal mulai/akhir, dan status progress.",
            side: "left",
            align: "start",
          },
        },
      ],
    });

    if (phase2Result === "closed") {
      cleanup();
      return;
    }

    // ─── Phase 3: Project Detail (Kanban) ───
    await router.push(`/workspace/${demoWsId}/project/${demoProjId}`);
    await sleep(500);

    await runPhase({
      doneBtnText: "Selesai ✓",
      steps: [
        {
          element: "#project-add-module-btn",
          popover: {
            title: "📋 Langkah 3: Buat Modul",
            description:
              "Modul ditampilkan sebagai kolom Kanban. Kamu bisa membuat banyak modul dan mengatur urutannya dengan drag & drop.",
            side: "left",
            align: "start",
          },
        },
        {
          element: "#project-kanban",
          popover: {
            title: "🎯 Kanban Board",
            description:
              "Ini Kanban Board kamu! Setiap kolom mewakili satu Modul Kerjaan. Drag kolom untuk mengatur urutan, atau drag kartu antar kolom.",
            side: "top",
            align: "center",
          },
        },
        {
          element: ".module-add-submodule-btn",
          popover: {
            title: "✅ Langkah 4: Tambah Submodul",
            description:
              "Langkah terakhir! Submodul adalah unit kerja terkecil — lengkap dengan status, tanggal, dan catatan rich text. Setelah tur selesai, coba buat sendiri!",
            side: "top",
            align: "center",
          },
        },
      ],
    });

    // Cleanup demo data and mark tour as completed
    cleanup(true);
  };

  return {
    hasCompletedTour,
    startDashboardTour,
    startCreationFlowTour,
    resetTour,
    markTourCompleted,
  };
}

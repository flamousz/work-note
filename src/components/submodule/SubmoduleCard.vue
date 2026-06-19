<script setup>
import { computed } from "vue";
import { Calendar, CheckSquare, Eye } from "lucide-vue-next";
import { format } from "date-fns";
import { useWorkNoteStore } from "../../stores/workNoteStore";

const props = defineProps({
  submodule: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["edit"]);

const store = useWorkNoteStore();

const progress = computed(() => {
  return store.getTaskProgress(props.submodule.id);
});

const statusInfo = computed(() => {
  switch (props.submodule.status) {
    case "belum_mulai":
      return {
        label: "Belum Mulai",
        classes: "bg-neutral-800 text-neutral-400 border-neutral-700/60",
      };
    case "dalam_pengerjaan":
      return {
        label: "Dalam Pengerjaan",
        classes: "bg-blue-950/45 text-blue-400 border-blue-900/40",
      };
    case "selesai":
      return {
        label: "Selesai",
        classes: "bg-emerald-950/45 text-emerald-400 border-emerald-900/40",
      };
    case "tertunda":
      return {
        label: "Tertunda",
        classes: "bg-amber-950/45 text-amber-400 border-amber-900/40",
      };
    default:
      return {
        label: "Unknown",
        classes: "bg-neutral-850 text-neutral-400 border-neutral-700",
      };
  }
});

const dateRange = computed(() => {
  if (!props.submodule.startDate && !props.submodule.endDate) return "";

  const start = props.submodule.startDate
    ? format(new Date(props.submodule.startDate), "dd MMM")
    : "?";
  const end = props.submodule.endDate
    ? format(new Date(props.submodule.endDate), "dd MMM yyyy")
    : "?";
  return `${start} - ${end}`;
});

const hasNotes = computed(() => {
  const desc = props.submodule.description || "";
  // Strip HTML to see if there is actual text
  const clean = desc.replace(/<[^>]*>/g, "").trim();
  return clean.length > 0;
});
</script>

<template>
  <div
    class="group bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700/80 p-3.5 rounded-lg shadow-sm hover:shadow-md hover:bg-neutral-900 transition-all duration-200 cursor-grab active:cursor-grabbing relative flex flex-col gap-2.5 overflow-hidden"
  >
    <!-- Accent line based on status -->
    <div
      class="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
      :class="{
        'bg-neutral-700': submodule.status === 'belum_mulai',
        'bg-blue-500': submodule.status === 'dalam_pengerjaan',
        'bg-emerald-500': submodule.status === 'selesai',
        'bg-amber-500': submodule.status === 'tertunda',
      }"
    ></div>

    <!-- Header / Name -->
    <div class="flex items-start justify-between gap-2.5 pl-1.5">
      <h4
        class="text-xs font-semibold text-neutral-100 group-hover:text-white transition-colors line-clamp-2 leading-relaxed"
      >
        {{ submodule.name }}
      </h4>
      <button
        @click.stop="emit('edit', submodule)"
        class="text-neutral-500 hover:text-white hover:bg-neutral-800 p-1 rounded transition cursor-pointer flex-shrink-0"
        title="Detail / Edit"
      >
        <Eye class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Details / Meta -->
    <div
      class="flex flex-wrap items-center justify-between gap-2 pl-1.5 pt-1 mt-auto"
    >
      <!-- Status Badge -->
      <span
        class="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border"
        :class="statusInfo.classes"
      >
        {{ statusInfo.label }}
      </span>

      <!-- Date or Notes icon -->
      <div class="flex items-center gap-2.5 text-neutral-500 text-[10px]">
        <!-- Task progress badge -->
        <span
          v-if="progress.total > 0"
          class="flex items-center gap-1 font-semibold"
          :class="progress.done === progress.total ? 'text-emerald-400' : 'text-neutral-400'"
          title="Progress Task Checklist"
        >
          <CheckSquare class="w-3.5 h-3.5" :class="progress.done === progress.total ? 'text-emerald-400' : 'text-neutral-500'" />
          {{ progress.done }}/{{ progress.total }}
        </span>

        <span
          v-if="dateRange"
          class="flex items-center gap-1 font-medium text-neutral-400"
        >
          <Calendar class="w-3 h-3 text-neutral-500" />
          {{ dateRange }}
        </span>
        <span
          v-if="hasNotes"
          class="flex items-center justify-center h-4 w-4 bg-neutral-800/80 text-violet-400 border border-neutral-700/40 rounded-full font-bold"
          title="Memiliki Catatan"
        >
          N
        </span>
      </div>
    </div>
  </div>
</template>

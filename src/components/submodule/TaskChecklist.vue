<script setup>
import { ref, computed, nextTick } from "vue";
import { useWorkNoteStore } from "../../stores/workNoteStore";
import { CheckSquare, Plus, X } from "lucide-vue-next";

const props = defineProps({
  submoduleId: {
    type: String,
    required: true,
  },
  tasks: {
    type: Array,
    default: () => [],
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  level: {
    type: Number,
    default: 0,
  },
});

const store = useWorkNoteStore();

function formatTaskDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const month = months[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);

  return `${hours}.${minutes}, ${day} ${month} ${year}`;
}

const submodule = computed(() => {
  return store.submodules.find((s) => s.id === props.submoduleId);
});

const currentTasks = computed(() => {
  if (props.level === 0) {
    return submodule.value?.tasks || [];
  }
  return props.tasks || [];
});

// Sort tasks: unchecked first, then checked. Stable sort by creation date.
const sortedTasks = computed(() => {
  return [...currentTasks.value].sort((a, b) => {
    if (a.done !== b.done) {
      return a.done ? 1 : -1;
    }
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
});

const progress = computed(() => {
  return store.getTaskProgress(props.submoduleId);
});

const newTaskText = ref("");
const subTaskText = ref("");
const activeSubInputId = ref(null);
const subInputRefs = ref({});

function handleAddTask() {
  const text = newTaskText.value.trim();
  if (!text) return;
  store.addTask(props.submoduleId, text);
  newTaskText.value = "";
}

function toggleSubInput(taskId) {
  if (activeSubInputId.value === taskId) {
    activeSubInputId.value = null;
    subTaskText.value = "";
  } else {
    activeSubInputId.value = taskId;
    subTaskText.value = "";
    nextTick(() => {
      const input = subInputRefs.value[taskId];
      if (input) {
        input.focus();
      }
    });
  }
}

function handleAddSubTask(parentId) {
  const text = subTaskText.value.trim();
  if (!text) return;
  store.addTask(props.submoduleId, text, parentId);
  subTaskText.value = "";
  nextTick(() => {
    const input = subInputRefs.value[parentId];
    if (input) {
      input.focus();
    }
  });
}

function cancelSubInput() {
  activeSubInputId.value = null;
  subTaskText.value = "";
}

function handleToggle(taskId) {
  store.toggleTask(props.submoduleId, taskId);
}

function handleDelete(taskId) {
  store.deleteTask(props.submoduleId, taskId);
}
</script>

<template>
  <div
    :class="[
      level === 0 ? 'pt-2' : 'mt-2 pl-6 border-l border-neutral-800/40 ml-2.5',
    ]"
  >
    <!-- Header: only at level 0 -->
    <div v-if="level === 0" class="flex justify-between items-center mb-4">
      <h4
        class="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"
      >
        <CheckSquare class="w-4 h-4 text-emerald-500" />
        Log Task
      </h4>
      <span
        class="text-xs text-neutral-400 bg-neutral-800/80 border border-neutral-700/50 px-2 py-0.5 rounded-full font-medium"
      >
        {{ progress.done }}/{{ progress.total }} selesai
      </span>
    </div>

    <!-- Add Input at Root level (Level 0 only) -->
    <div v-if="level === 0 && !readonly" class="mb-4">
      <div class="relative">
        <input
          v-model="newTaskText"
          type="text"
          placeholder="Tambah task baru... (tekan Enter)"
          class="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2 pl-3 pr-10 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          @keydown.enter.prevent="handleAddTask"
        />
        <kbd
          class="absolute right-3 top-2.5 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-500 bg-neutral-850 rounded border border-neutral-800"
        >
          Enter
        </kbd>
      </div>
    </div>

    <!-- Tasks List with animated transitions -->
    <TransitionGroup name="task-list" tag="div" class="space-y-1.5 relative">
      <div
        v-for="task in sortedTasks"
        :key="task.id"
        class="group/item flex flex-col"
      >
        <!-- Task Row -->
        <div
          class="flex items-start justify-between py-1 px-2 -mx-2 rounded hover:bg-neutral-800/30 transition-colors"
        >
          <label class="flex items-start gap-2.5 flex-1 min-w-0 cursor-pointer">
            <input
              type="checkbox"
              :checked="task.done"
              class="mt-0.5 h-3.5 w-3.5 rounded border-neutral-850 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 bg-neutral-900 cursor-pointer"
              @change="handleToggle(task.id)"
            />
            <span
              :class="[
                'text-xs break-words leading-relaxed transition-all duration-300 select-none',
                task.done
                  ? 'text-neutral-500 line-through opacity-60'
                  : 'text-neutral-300',
              ]"
            >
              {{ task.text }}
            </span>
          </label>

          <!-- Right side info & actions -->
          <div class="flex items-center gap-3 shrink-0 ml-2 self-center">
            <!-- Date Display -->
            <div
              v-if="task.createdAt"
              class="text-[10px] text-neutral-500 italic whitespace-nowrap select-none flex items-center gap-1"
            >
              <span>{{ formatTaskDate(task.createdAt) }}</span>
              <template v-if="task.done && task.updatedAt">
                <span class="text-emerald-500 font-medium">-</span>
                <span class="text-emerald-500 font-medium">{{
                  formatTaskDate(task.updatedAt)
                }}</span>
              </template>
            </div>

            <!-- Hover buttons for Actions -->
            <div
              v-if="!readonly"
              class="flex items-center gap-1.5 min-w-[40px] justify-end"
            >
              <!-- Add child button: Level 0 and 1 only -->
              <button
                v-if="level < 2"
                type="button"
                class="opacity-0 group-hover/item:opacity-100 p-0.5 hover:text-emerald-400 text-neutral-400 hover:bg-neutral-800/60 rounded transition-all duration-200 cursor-pointer"
                title="Tambah sub-task"
                @click="toggleSubInput(task.id)"
              >
                <Plus class="w-3.5 h-3.5" />
              </button>

              <!-- Delete button -->
              <button
                type="button"
                class="opacity-0 group-hover/item:opacity-100 p-0.5 hover:text-red-400 text-neutral-400 hover:bg-neutral-800/60 rounded transition-all duration-200 cursor-pointer"
                title="Hapus task"
                @click="handleDelete(task.id)"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Inline sub-task input -->
        <div
          v-if="activeSubInputId === task.id && !readonly"
          class="ml-6 mt-1 mb-2"
        >
          <div class="relative">
            <input
              :ref="
                (el) => {
                  if (el) subInputRefs[task.id] = el;
                }
              "
              v-model="subTaskText"
              type="text"
              :placeholder="`Tambah sub-task untuk '${task.text}'...`"
              class="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-1.5 pl-3 pr-10 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              @keydown.enter.prevent="handleAddSubTask(task.id)"
              @keyup.esc="cancelSubInput"
            />
            <kbd
              class="absolute right-3 top-2 px-1.5 py-0.5 text-[8px] font-semibold text-neutral-500 bg-neutral-850 rounded border border-neutral-800"
            >
              Enter
            </kbd>
          </div>
        </div>

        <!-- Child checklists -->
        <TaskChecklist
          v-if="task.children && task.children.length > 0"
          :submodule-id="submoduleId"
          :tasks="task.children"
          :readonly="readonly"
          :level="level + 1"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* Animated transition for task list sorting */
.task-list-move {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.task-list-enter-active,
.task-list-leave-active {
  transition: all 0.3s ease;
}

.task-list-enter-from,
.task-list-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

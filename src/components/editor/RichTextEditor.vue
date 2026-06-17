<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Tulis deskripsi...'
  }
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    attributes: {
      class: 'tiptap focus:outline-none min-h-[150px] max-h-[300px] overflow-y-auto px-4 py-3 text-neutral-200 text-sm bg-neutral-900/60 rounded-b-md',
    },
  },
})

// Sync changes from parent component
watch(() => props.modelValue, (newVal) => {
  if (editor.value && editor.value.getHTML() !== newVal) {
    editor.value.commands.setContent(newVal, false)
  }
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<template>
  <div class="flex flex-col border border-neutral-700/60 rounded-md overflow-hidden bg-neutral-900/40 text-neutral-200">
    <!-- Toolbar -->
    <div class="flex flex-wrap gap-1 items-center p-2 border-b border-neutral-700/60 bg-neutral-950/80">
      <button
        type="button"
        @click="editor?.chain().focus().toggleBold().run()"
        :class="editor?.isActive('bold') ? 'bg-violet-600 text-white border-violet-500' : 'hover:bg-neutral-800 text-neutral-300 border-neutral-700'"
        class="p-1 px-2 text-xs font-semibold rounded transition border cursor-pointer"
      >
        Bold
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().toggleItalic().run()"
        :class="editor?.isActive('italic') ? 'bg-violet-600 text-white border-violet-500' : 'hover:bg-neutral-800 text-neutral-300 border-neutral-700'"
        class="p-1 px-2 text-xs font-semibold rounded transition border cursor-pointer"
      >
        Italic
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().toggleStrike().run()"
        :class="editor?.isActive('strike') ? 'bg-violet-600 text-white border-violet-500' : 'hover:bg-neutral-800 text-neutral-300 border-neutral-700'"
        class="p-1 px-2 text-xs font-semibold rounded transition border cursor-pointer"
      >
        Strike
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().toggleCode().run()"
        :class="editor?.isActive('code') ? 'bg-violet-600 text-white border-violet-500' : 'hover:bg-neutral-800 text-neutral-300 border-neutral-700'"
        class="p-1 px-2 text-xs font-semibold rounded transition border cursor-pointer"
      >
        Code
      </button>
      <div class="h-4 w-px bg-neutral-700 mx-1"></div>
      <button
        type="button"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="editor?.isActive('heading', { level: 1 }) ? 'bg-violet-600 text-white border-violet-500' : 'hover:bg-neutral-800 text-neutral-300 border-neutral-700'"
        class="p-1 px-2 text-xs font-semibold rounded transition border cursor-pointer"
      >
        H1
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="editor?.isActive('heading', { level: 2 }) ? 'bg-violet-600 text-white border-violet-500' : 'hover:bg-neutral-800 text-neutral-300 border-neutral-700'"
        class="p-1 px-2 text-xs font-semibold rounded transition border cursor-pointer"
      >
        H2
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().toggleBulletList().run()"
        :class="editor?.isActive('bulletList') ? 'bg-violet-600 text-white border-violet-500' : 'hover:bg-neutral-800 text-neutral-300 border-neutral-700'"
        class="p-1 px-2 text-xs font-semibold rounded transition border cursor-pointer"
      >
        List
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().toggleOrderedList().run()"
        :class="editor?.isActive('orderedList') ? 'bg-violet-600 text-white border-violet-500' : 'hover:bg-neutral-800 text-neutral-300 border-neutral-700'"
        class="p-1 px-2 text-xs font-semibold rounded transition border cursor-pointer"
      >
        Num List
      </button>
      <div class="h-4 w-px bg-neutral-700 mx-1"></div>
      <button
        type="button"
        @click="editor?.chain().focus().clearNodes().unsetAllMarks().run()"
        class="p-1 px-2 text-xs font-semibold rounded hover:bg-neutral-800 text-neutral-400 border border-neutral-700 transition cursor-pointer"
      >
        Clear
      </button>
    </div>
    
    <!-- Editor Content Area -->
    <editor-content :editor="editor" />
  </div>
</template>

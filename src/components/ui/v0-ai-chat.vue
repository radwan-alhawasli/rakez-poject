<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowUpIcon, CircleUserRound, Figma, FileUp, ImageIcon, MonitorIcon, Paperclip, PlusIcon } from 'lucide-vue-next'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface ActionItem {
  icon: unknown
  label: string
}

interface Props {
  title?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'What can I help you ship?',
  placeholder: 'Ask v0 a question...',
})

const value = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const minHeight = 60
const maxHeight = 200

const actionItems: ActionItem[] = [
  { icon: ImageIcon, label: 'Clone a Screenshot' },
  { icon: Figma, label: 'Import from Figma' },
  { icon: FileUp, label: 'Upload a Project' },
  { icon: MonitorIcon, label: 'Landing Page' },
  { icon: CircleUserRound, label: 'Sign Up Form' },
]

function adjustHeight(reset = false) {
  const textarea = textareaRef.value
  if (!textarea) return

  if (reset) {
    textarea.style.height = `${minHeight}px`
    return
  }

  textarea.style.height = `${minHeight}px`
  const nextHeight = Math.max(
    minHeight,
    Math.min(textarea.scrollHeight, maxHeight)
  )
  textarea.style.height = `${nextHeight}px`
}

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  value.value = target.value
  adjustHeight()
}

function handleSend() {
  if (!value.value.trim()) return
  value.value = ''
  adjustHeight(true)
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function handleResize() {
  adjustHeight()
}

const sendButtonClasses = computed(() =>
  cn(
    'flex items-center justify-between gap-1 rounded-lg border px-1.5 py-1.5 text-sm transition-colors',
    value.value.trim()
      ? 'border-white bg-white text-black'
      : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800'
  )
)

onMounted(() => {
  adjustHeight(true)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col items-center space-y-8 p-4">
    <h1 class="text-center text-4xl font-bold text-black dark:text-white">
      {{ props.title }}
    </h1>

    <div class="w-full">
      <div class="relative rounded-xl border border-neutral-800 bg-neutral-900">
        <div class="overflow-y-auto">
          <Textarea
            ref="textareaRef"
            :model-value="value"
            :placeholder="props.placeholder"
            :class="cn(
              'min-h-[60px] w-full resize-none border-none bg-transparent px-4 py-3 text-sm text-white',
              'focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
              'placeholder:text-sm placeholder:text-neutral-500'
            )"
            :style="{ overflow: 'hidden' }"
            @update:model-value="value = String($event ?? '')"
            @input="handleInput"
            @keydown="handleKeyDown"
          />
        </div>

        <div class="flex items-center justify-between p-3">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="group flex items-center gap-1 rounded-lg p-2 transition-colors hover:bg-neutral-800"
            >
              <Paperclip class="h-4 w-4 text-white" />
              <span class="hidden text-xs text-zinc-400 transition-opacity group-hover:inline">
                Attach
              </span>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex items-center justify-between gap-1 rounded-lg border border-dashed border-zinc-700 px-2 py-1 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
            >
              <PlusIcon class="h-4 w-4" />
              Project
            </button>

            <button
              type="button"
              :class="sendButtonClasses"
              @click="handleSend"
            >
              <ArrowUpIcon
                :class="cn('h-4 w-4', value.trim() ? 'text-black' : 'text-zinc-400')"
              />
              <span class="sr-only">Send</span>
            </button>
          </div>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          v-for="item in actionItems"
          :key="item.label"
          type="button"
          class="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
        >
          <component :is="item.icon" class="h-4 w-4" />
          <span class="text-xs">{{ item.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

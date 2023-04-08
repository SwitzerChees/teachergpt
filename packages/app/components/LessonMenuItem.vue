<template>
  <div class="pl-1 border-blue-500 flex">
    <NuxtLink
      :to="toLink()"
      class="flex gap-2 items-center grow cursor-pointer hover:bg-slate-800 p-2 rounded transition-colors hover:text-blue-500"
      :class="{
        ' text-blue-500': isActive,
      }">
      <Icon name="material-symbols:play-lesson" size="1.5rem" class="flex-shrink-0" />
      <div class="flex flex-col">
        <span class="text-sm">{{ formatDate(lesson.execution) }}</span>
        <span class="text-xs">{{ lesson.title }}</span>
      </div>
    </NuxtLink>
    <div
      class="w-1 bg-blue-500 transition-colors"
      :class="{
        'bg-transparent': !isActive,
      }"></div>
  </div>
</template>
<script setup lang="ts">
  import { Lesson } from '@mylearning/common'
  import { defineProps } from 'vue'
  const props = defineProps<{ lesson: Lesson }>()
  const route = useRoute()

  const formatDate = (date: Date | undefined) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`
  }

  const isActive = computed(() => route.path.startsWith(toLink()))
  const toLink = () => `/course/${props.lesson.course.id}/lesson/${props.lesson.id}`
</script>

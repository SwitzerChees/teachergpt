<template>
  <NuxtLink
    :to="toLink()"
    class="flex flex-col cursor-pointer hover:bg-slate-900 p-2 rounded transition-colors text-slate-300 hover:text-white"
    :class="{
      'bg-slate-700 text-white font-bold': isActive,
    }">
    <span class="text-sm self-start text-gray-300">{{ course.school?.name }}</span>
    <div class="flex gap-2 items-center">
      <Icon name="mdi:book-education" size="1.5rem" class="flex-shrink-0" />
      <span class="text-sm">{{ course.name }}</span>
    </div>
  </NuxtLink>
</template>
<script setup lang="ts">
  import { Course } from '@teachergpt/common'
  import { defineProps } from 'vue'
  const props = defineProps<{ course: Course }>()
  const route = useRoute()

  const isActive = computed(() => route.path.startsWith(toLink()))
  const toLink = () => `/course/${props.course.id}`
</script>

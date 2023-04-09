<template>
  <NuxtLink
    :to="toLink()"
    class="flex gap-2 items-center cursor-pointer hover:bg-slate-900 p-2 rounded transition-colors text-slate-300 hover:text-white"
    :class="{
      'bg-slate-700 text-white font-bold': isActive,
    }">
    <Icon name="mdi:book-education" size="1.5rem" class="flex-shrink-0" />
    <span class="text-sm">{{ course.name }}</span>
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

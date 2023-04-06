<template>
  <NuxtLink
    :to="`/course/${course.id}`"
    class="flex gap-2 items-center cursor-pointer hover:bg-slate-900 p-2 rounded transition-colors text-slate-300 hover:text-white">
    <Icon name="mdi:book-education" size="1.5rem" class="flex-shrink-0" />
    <span class="text-sm">{{ course.name }}</span>
  </NuxtLink>
</template>
<script setup lang="ts">
  import { Course } from '@mylearning/common'
  import { defineProps } from 'vue'
  defineProps<{ course: Course }>()
</script>

<template>
  <div class="bg-slate-900 w-56 min-w-[14rem] border-r border-gray-700 flex flex-col">
    <NuxtLink
      :to="toLink()"
      class="flex h-16 gap-2 justify-center items-center cursor-pointer hover:bg-slate-800 p-2 transition-colors hover:text-blue-500"
      :class="{
        'bg-slate-700 font-bold text-blue-500': isActive,
      }">
      <span>Kursübersicht</span>
    </NuxtLink>
    <LessonMenuItem v-for="lesson in lessons" :key="lesson.id" :lesson="lesson" />
  </div>
</template>
<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  const route = useRoute()
  const { lessons, selectedCourse } = storeToRefs(useSidebarsStore())

  const isActive = computed(() => route.path === toLink())
  const toLink = () => `/course/${selectedCourse.value?.id}`
</script>

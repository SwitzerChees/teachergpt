import CourseMenuItem from './CourseMenuItem.vue';

<template>
  <div class="bg-slate-800 w-52 border-r border-gray-700 flex flex-col">
    <div class="flex items-center p-2 border-b border-gray-700 gap-2">
      <div class="rounded-full overflow-hidden flex justify-center items-center w-12 h-12">
        <img width="60" src="~/assets/images/logo.png" />
      </div>
      <div class="flex flex-col">
        <h2 class="font-bold">AI Learning</h2>
        <h3 class="text-sm text-gray-300">Kurse</h3>
      </div>
    </div>
    <div class="p-2">
      <CourseMenuItem v-for="course in courses" :key="course.id" :course="course" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Course } from '@mylearning/common'
  const { getSafeAPIResponse } = useAPI()

  const courses = ref<Course[]>([])

  onMounted(async () => {
    const { find } = useStrapi()
    const request = find('courses')
    const { ok, result } = await getSafeAPIResponse<Course[]>(request)
    if (!ok) return
    courses.value = result
  })
</script>

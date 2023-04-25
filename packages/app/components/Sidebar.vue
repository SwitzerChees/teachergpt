import CourseMenuItem from './CourseMenuItem.vue';

<template>
  <div class="bg-slate-800 w-64 lg:min-w-[16rem] border-r border-gray-700 flex flex-col mt-16 lg:mt-0">
    <div class="flex items-center p-2 border-b border-gray-700 gap-2">
      <div class="rounded-full overflow-hidden flex justify-center items-center w-12 h-12">
        <img width="60" src="~/assets/images/logo.png" />
      </div>
      <div class="flex flex-col">
        <h2 class="font-bold">Teacher GPT</h2>
        <h3 class="text-sm text-gray-300">Kurse</h3>
      </div>
    </div>
    <div class="p-2 grow">
      <CourseMenuItem v-for="course in courses" :key="course.id" :course="course" />
    </div>
    <div class="flex justify-center pb-4">
      <Button class="p-button-text" @click="logoutRefresh">
        <div class="flex gap-2 font-bold">
          <Icon name="material-symbols:logout" size="1.5rem" class="flex-shrink-0" />
          <span>Ausloggen</span>
        </div>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia'

  const { courses } = storeToRefs(useSidebarsStore())
  const { fetchCourses } = useSidebarsStore()
  const { logout } = useStrapiAuth()

  const logoutRefresh = () => {
    logout()
    location.reload()
  }

  onMounted(() => {
    fetchCourses()
  })
</script>

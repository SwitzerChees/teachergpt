<template>
  <div class="flex h-screen w-full relative">
    <div class="flex flex-col flex-grow items-stretch px-6 py-2 w-full">
      <slot />
    </div>
    <div
      class="absolute top-0 bottom-0 left-0 right-0 h-screen w-full flex bg-slate-800 transition-all duration-300"
      :class="{
        'translate-x-[-100%]': !showSidebar,
        'translate-x-0': showSidebar,
      }">
      <Sidebar />
      <LessonsSidebar />
    </div>
    <div class="absolute top-2 left-2">
      <Button size="small" @click="showSidebar = !showSidebar">
        <Icon name="material-symbols:menu-rounded" size="1.5rem" class="flex-shrink-0" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  const showSidebar = ref(false)
</script>

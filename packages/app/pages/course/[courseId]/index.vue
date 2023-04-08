<template>
  <div class="grow flex flex-col gap-4">
    <div class="flex items-center gap-4 flex-col">
      <Icon name="mdi:book-education" size="5rem" class="flex-shrink-0" />
      <h1>{{ selectedCourse?.name }}</h1>
      <span>{{ selectedCourse?.description }}</span>
    </div>
    <div class="flex grow overflow-y-auto h-8 mb-4">
      <OverviewTab />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia'

  const { selectedCourse } = storeToRefs(useSidebarsStore())
</script>

<template>
  <div class="grow flex flex-col gap-4">
    <div class="flex items-center gap-4 flex-col">
      <Icon name="material-symbols:play-lesson" size="5rem" class="flex-shrink-0" />
      <h1 class="text-center">{{ selectedLesson?.title }}</h1>
      <span class="text-center">Durchgeführt am: {{ formatDate(selectedLesson?.execution, true) }}</span>
    </div>
    <div class="flex grow overflow-y-auto h-8 mb-4">
      <OverviewTab />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { formatDate } from '~/utils'

  const { selectedLesson } = storeToRefs(useSidebarsStore())
</script>

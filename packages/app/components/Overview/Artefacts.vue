<template>
  <DataTable :value="artefacts" selection-mode="single" class="select-none w-full" striped-rows responsive-layout="scroll">
    <Column :header-style="{ width: '50px ' }" field="type" header="" :style="{ width: '50px' }">
      <template #body>
        <div class="flex items-center gap-2">
          <Icon name="carbon:document" size="1.5rem" />
        </div>
      </template>
    </Column>
    <Column field="file.name" header="Name" :sortable="true"></Column>
    <Column field="lesson.title" header="Lektion" :sortable="true"></Column>
    <Column :header-style="{ width: '200px ' }" field="updatedAt" header="Erstellt am" :style="{ width: '200px' }" :sortable="true">
      <template #body="{ data: { updatedAt } }">
        {{ formatDate(updatedAt) }}
      </template>
    </Column>
    <template #empty>
      <div class="w-full flex justify-center">
        <div class="flex flex-col items-center gap-2">
          <Icon name="iconoir:file-not-found" size="3rem" />
          <span class="font-bold">Kein Material gefunden</span>
        </div>
      </div>
    </template>
  </DataTable>
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia'

  const { artefacts } = storeToRefs(useArtefactsStore())
</script>

<template>
  <TabView class="grow panel-full-height" :scrollable="true">
    <TabPanel header="Fragen">
      <OverviewQuestions />
    </TabPanel>
    <TabPanel header="Zusammenfassung">
      <Markdown :source="summary" class="markdown-format" />
    </TabPanel>
    <TabPanel header="Material">
      <OverviewArtefacts />
    </TabPanel>
    <!-- <TabPanel header="Links & Ressourcen">
      <p>
        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos
        dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia
        animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta
        nobis est eligendi optio cumque nihil impedit quo minus.
      </p>
    </TabPanel> -->
  </TabView>
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia'

  const { selectedCourse, selectedLesson } = storeToRefs(useSidebarsStore())

  const summary = computed(() => {
    if (selectedLesson.value) return selectedLesson.value.summary || ''
    if (selectedCourse.value) return selectedCourse.value.summary || ''
    return ''
  })
</script>

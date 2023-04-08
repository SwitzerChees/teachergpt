<template>
  <div class="flex flex-col gap-4">
    <Chatbox />
    <Question v-for="question in questions" :key="question.id" :question="question" />
  </div>
</template>
<script setup lang="ts">
  import { storeToRefs } from 'pinia'

  const { questions } = storeToRefs(useQuestionsStore())
</script>

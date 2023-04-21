<template>
  <div class="flex justify-center p-2">
    <div class="w-2/3 flex flex-col gap-2">
      <span class="self-center text-sm"
        >Stelle eine beliebige Frage über den Inhalt des Kurses und GPT wid versuchen, dir weiterzuhelfen.</span
      >
      <InputText v-model="question" type="text" :disabled="questionLimit < 1" placeholder="Meine Frage..." @keyup.enter="executeQuestion" />
      <span v-if="questionLimit > 0" class="self-center text-xs text-gray-300"
        >Sie haben jeweils eine begrenzte Anzahl an Fragen pro Tag. Aktuell haben Sie noch
        <span class="font-bold">{{ questionLimit }}</span> Fragen zur Verfügung.</span
      >
      <span v-else class="self-center text-xs text-red-400">Sie haben für heute keine Fragen mehr zur Verfügung.</span>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { storeToRefs } from 'pinia'

  const question = ref('')
  const { addQuestion } = useQuestionsStore()
  const { questionLimit } = storeToRefs(useQuestionsStore())

  const executeQuestion = () => {
    if (!question.value) return
    addQuestion(question.value)
    question.value = ''
  }
</script>

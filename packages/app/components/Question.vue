<template>
  <div class="flex flex-col gap-2 bg-slate-800 p-4 rounded">
    <div class="flex justify-between pb-2 border-b border-gray-700">
      <div class="flex flex-col">
        <span class="font-bold">Frage</span>
        <p>{{ question.question }}</p>
      </div>
      <div class="flex flex-col">
        <span class="text-sm text-gray-300"><span class="font-bold">Gestellt am:</span> {{ formatDate(question.createdAt) }}</span>
        <span v-if="question.user" class="text-sm text-gray-300"
          ><span class="font-bold">Gestellt von:</span> {{ question.user.email }}</span
        >
        <span v-if="question.course" class="text-sm text-gray-300"><span class="font-bold">Kurs:</span> {{ question.course.name }}</span>
        <span v-if="question.lesson" class="text-sm text-gray-300"
          ><span class="font-bold">Lektion:</span> {{ question.lesson?.title }}</span
        >
      </div>
    </div>
    <span class="font-bold">Antwort</span>
    <div v-if="question.status === ProcessingStates.Open" class="flex flex-col gap-2">
      <span class="text-orange-400"
        >Gib mir einen moment ich durchsuche die Kursmaterialien für dich um eine passende Antwort zu liefern...</span
      >
      <Skeleton></Skeleton>
      <Skeleton width="20rem"></Skeleton>
      <Skeleton width="10rem"></Skeleton>
    </div>
    <div v-else-if="question.status === ProcessingStates.Error" class="flex flex-col gap-2">
      <span class="text-red-400">Da ist was schief gelaufen. Ich konnte leider keine passende Antwort finden.</span>
      <span class="text-red-400">Bitte versuche es später noch einmal.</span>
    </div>
    <div v-else>
      <Markdown :source="formatedAnswer" class="markdown-format" />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { Question } from '@teachergpt/common'
  import { ProcessingStates } from '@teachergpt/common/definitions'
  import { formatDate } from '~/utils'

  const props = defineProps<{ question: Question }>()

  const formatedAnswer = computed(() => {
    return props.question.answer || ''
  })
</script>

import { defineStore, storeToRefs } from 'pinia'

import { ProcessingStates, Question, User } from '@teachergpt/common/definitions'

const questions = ref<Question[]>([])
const questionLimit = ref(0)

export const useQuestionsStore = defineStore('questions', () => {
  const { getSafeAPIResponse } = useAPI()
  const { find, create } = useStrapi()
  const user = useStrapiUser()

  if (user.value) {
    questionLimit.value = (user.value as unknown as User).questionLimit || 0
  }

  const fetchQuestions = async () => {
    const request = find('questions', {
      filters: {
        lesson: selectedLesson.value?.id,
        course: selectedCourse.value?.id,
        status: { $ne: ProcessingStates.Archived },
      },
      populate: {
        course: {
          fields: ['id', 'name'],
        },
        lesson: {
          fields: ['id', 'title'],
        },
        user: {
          fields: ['id', 'email'],
        },
      },
      sort: ['createdAt:desc'],
    })
    const { ok, result } = await getSafeAPIResponse<Question[]>(request)
    if (!ok) return
    questions.value = result
  }

  const fetchOpenQuestions = async () => {
    const openQuestions = questions.value.filter((q) => q.status === ProcessingStates.Open)
    if (openQuestions.length === 0) return
    const request = find('questions', {
      fields: ['id', 'answer', 'status'],
      filters: {
        id: { $in: openQuestions.map((q) => q.id) },
        lesson: selectedLesson.value?.id,
        course: selectedCourse.value?.id,
      },
    })
    const { ok, result } = await getSafeAPIResponse<Question[]>(request)
    if (!ok) return
    for (const openQuestion of result) {
      if (openQuestion.status !== ProcessingStates.Error && openQuestion.status !== ProcessingStates.Done) continue
      const foundQuestion = questions.value.find((q) => q.id === openQuestion.id)
      if (!foundQuestion) continue
      foundQuestion.answer = openQuestion.answer
      foundQuestion.status = openQuestion.status
    }
  }

  const addQuestion = async (question: string) => {
    const request = create('questions', {
      question,
      user: user.value?.id,
      lesson: selectedLesson.value?.id,
      course: selectedCourse.value?.id,
    })
    const { ok, result } = await getSafeAPIResponse<Question>(request)
    if (!ok) return
    questionLimit.value--
    if (selectedCourse.value) result.course = selectedCourse.value
    if (selectedLesson.value) result.lesson = selectedLesson.value
    if (user.value) result.user = user.value as unknown as User
    questions.value.unshift(result)
  }

  const { selectedCourse, selectedLesson } = storeToRefs(useSidebarsStore())
  watch([selectedCourse, selectedLesson], () => {
    fetchQuestions()
  })

  setInterval(() => {
    fetchOpenQuestions()
  }, 2000)

  return { questions, questionLimit, fetchQuestions, addQuestion }
})

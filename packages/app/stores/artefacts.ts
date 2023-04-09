import { defineStore, storeToRefs } from 'pinia'

import { Artefact, ProcessingStates } from '@teachergpt/common/definitions'

const artefacts = ref<Artefact[]>([])

export const useArtefactsStore = defineStore('artefacts', () => {
  const { getSafeAPIResponse } = useAPI()
  const { find } = useStrapi()

  const fetchArtefacts = async () => {
    const request = find('artefacts', {
      filters: {
        lesson: selectedLesson.value?.id,
        course: selectedCourse.value?.id,
        status: { $ne: ProcessingStates.Archived },
      },
      populate: {
        file: true,
        lesson: {
          fields: ['id', 'title'],
        },
      },
      sort: ['createdAt:desc'],
    })
    const { ok, result } = await getSafeAPIResponse<Artefact[]>(request)
    if (!ok) return
    artefacts.value = result
  }

  const { selectedCourse, selectedLesson } = storeToRefs(useSidebarsStore())
  watch([selectedCourse, selectedLesson], () => {
    fetchArtefacts()
  })

  return { artefacts, fetchArtefacts }
})

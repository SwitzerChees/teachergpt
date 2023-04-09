import { defineStore, storeToRefs } from 'pinia'

import { Artefact } from '@mylearning/common/definitions'

const artefacts = ref<Artefact[]>([])

export const useArtefactsStore = defineStore('artefacts', () => {
  const { getSafeAPIResponse } = useAPI()
  const { find } = useStrapi()

  const fetchArtefacts = async () => {
    const request = find('artefacts', {
      filters: {
        lesson: selectedLesson.value?.id,
        course: selectedCourse.value?.id,
      },
      populate: {
        file: true,
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

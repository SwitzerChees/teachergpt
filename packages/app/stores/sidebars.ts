import { defineStore } from 'pinia'

import { Course, Lesson } from '@mylearning/common/definitions'

const courses = ref<Course[]>([])
const selectedCourse = ref<Course>()
const lessons = ref<Lesson[]>([])
const selectedLesson = ref<Lesson>()

export const useSidebarsStore = defineStore('sidebars', () => {
  const { getSafeAPIResponse } = useAPI()
  const { find } = useStrapi()
  const route = useRoute()

  const fetchCourses = async () => {
    const request = find('courses')
    const { ok, result } = await getSafeAPIResponse<Course[]>(request)
    if (!ok) return
    courses.value = result
    selectCourse()
  }

  const fetchLessons = async (course: Course) => {
    const request = find('lessons', { filters: { course: course.id }, populate: ['course'] })
    const { ok, result } = await getSafeAPIResponse<Lesson[]>(request)
    if (!ok) return
    lessons.value = result
    selectLesson()
  }

  const selectCourse = () => {
    if (!route.params.courseId) return
    const courseId = Number(route.params.courseId)
    const course = courses.value.find((c) => c.id === courseId)
    if (!course) return
    selectedCourse.value = course
  }

  const selectLesson = () => {
    if (!route.params.lessonId) return
    const lessonId = Number(route.params.lessonId)
    const lesson = lessons.value.find((l) => l.id === lessonId)
    if (!lesson) return
    selectedLesson.value = lesson
  }

  watch(selectedCourse, () => {
    if (!selectedCourse.value) return
    fetchLessons(selectedCourse.value)
  })
  watch(route, () => {
    selectCourse()
    selectLesson()
  })

  return { courses, selectedCourse, lessons, selectedLesson, fetchCourses, fetchLessons }
})
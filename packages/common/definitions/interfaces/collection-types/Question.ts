import { Course, Lesson, StrapiObject } from '.'

interface Question extends StrapiObject {
  question: string
  answer?: string
  course: Course
  lesson?: Lesson
}

export { Question }

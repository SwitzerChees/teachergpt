import { Course, StrapiObject } from '.'

interface Lesson extends StrapiObject {
  title: string
  summary?: string
  execution?: Date
  course: Course
}

export { Lesson }

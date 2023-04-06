import { Lesson, StrapiObject } from '.'

interface Course extends StrapiObject {
  name: string
  summary?: string
  description?: string
  lessons: Lesson[]
}

export { Course }

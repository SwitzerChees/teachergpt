import { Artefact, Course, StrapiObject } from '.'

interface Lesson extends StrapiObject {
  title: string
  summary?: string
  execution?: Date
  artefacts: Artefact[]
  course: Course
}

export { Lesson }

import { Course, Lesson, StrapiAsset, StrapiObject } from '.'

interface Artefact extends StrapiObject {
  file: StrapiAsset
  transcript?: string
  course: Course
  lesson: Lesson
}

export { Artefact }

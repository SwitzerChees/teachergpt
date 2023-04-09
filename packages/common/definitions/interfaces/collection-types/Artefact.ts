import { ProcessingStatus } from '../../enums'
import { Course, Lesson, StrapiAsset, StrapiObject } from '.'

interface Artefact extends StrapiObject {
  file: StrapiAsset
  transcript?: string
  course: Course
  lesson: Lesson
  status: ProcessingStatus
  embeddings: { transcript: string; embedding: number[] }[]
}

export { Artefact }

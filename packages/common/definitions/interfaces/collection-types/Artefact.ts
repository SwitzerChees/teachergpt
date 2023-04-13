import { ProcessingStatus } from '../../enums'
import { Course, Embedding, Lesson, Page, StrapiAsset, StrapiObject } from '.'

interface Artefact extends StrapiObject {
  file: StrapiAsset
  transcript?: string
  course: Course
  lesson: Lesson
  status: ProcessingStatus
  pages: Page[]
  embeddings: Embedding[]
}

export { Artefact }

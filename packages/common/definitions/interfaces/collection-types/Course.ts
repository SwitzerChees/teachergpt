import { ProcessingStatus } from '../../enums'
import { Artefact, Lesson, School, StrapiObject, User } from '.'

interface Course extends StrapiObject {
  name: string
  summary?: string
  description?: string
  lessons: Lesson[]
  artefacts: Artefact[]
  school: School
  user: User
  status: ProcessingStatus
}

export { Course }

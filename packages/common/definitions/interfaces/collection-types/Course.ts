import { Artefact, Lesson, StrapiObject, User } from '.'

interface Course extends StrapiObject {
  name: string
  summary?: string
  description?: string
  lessons: Lesson[]
  artefacts: Artefact[]
  user: User
}

export { Course }

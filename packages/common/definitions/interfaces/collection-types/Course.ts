import { Lesson, StrapiObject, User } from '.'

interface Course extends StrapiObject {
  name: string
  summary?: string
  description?: string
  lessons: Lesson[]
  user: User
}

export { Course }

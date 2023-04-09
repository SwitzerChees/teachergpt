import { ProcessingStatus } from '../../enums'
import { Course, Lesson, StrapiObject, User } from '.'

interface Question extends StrapiObject {
  question: string
  answer?: string
  course: Course
  lesson?: Lesson
  user: User
  status: ProcessingStatus
}

export { Question }

import { Course, Lesson, StrapiObject, User } from '.'

interface Question extends StrapiObject {
  question: string
  answer?: string
  course: Course
  lesson?: Lesson
  user: User
  status: 'open' | 'done'
}

export { Question }

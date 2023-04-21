import { Course, StrapiObject } from '.'

interface School extends StrapiObject {
  name: string
  courses: Course[]
}

export { School }

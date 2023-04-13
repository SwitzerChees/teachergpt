import { StrapiObject } from '.'

interface Page extends StrapiObject {
  pageNumber: number
  text: string
}

export { Page }

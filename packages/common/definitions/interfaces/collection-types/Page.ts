import { Embedding, StrapiObject } from '.'

interface Page extends StrapiObject {
  pageNumber: number
  text: string
  embedding: Embedding
}

export { Page }

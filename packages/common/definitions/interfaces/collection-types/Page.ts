import { Artefact, Embedding, StrapiObject } from '.'

interface Page extends StrapiObject {
  pageNumber: number
  text: string
  embedding: Embedding
  artefact: Artefact
}

export { Page }

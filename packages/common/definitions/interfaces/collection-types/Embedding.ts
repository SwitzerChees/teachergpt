import { Artefact, Page, StrapiObject } from '.'

interface Embedding extends StrapiObject {
  text: string
  embedding: number[]
  artefact: Artefact
  page: Page
}

export { Embedding }

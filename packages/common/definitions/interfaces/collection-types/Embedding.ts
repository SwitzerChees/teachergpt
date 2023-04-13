import { Artefact, StrapiObject } from '.'

interface Embedding extends StrapiObject {
  text: string
  embedding: number[]
  artefact: Artefact
}

export { Embedding }

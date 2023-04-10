interface EmbeddingDocument {
  transcript: string
  embedding: number[]
  source: string
  courseId: number
  lessonId: number
}

export { EmbeddingDocument }

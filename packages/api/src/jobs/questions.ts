import { BullStrapi, Embedding, Question } from '@teachergpt/common'
import { Job } from 'bullmq'
import { completePrompt, getEmbeddings } from './openai'
import { generateContext, questionPrompt } from './prompts'

export const processQuestions = (strapi: BullStrapi) => {
  return async (_1: Job) => {
    const openQuestions = (await strapi.entityService.findMany('api::question.question', {
      filters: {
        status: 'open',
        course: {
          id: { $ne: null },
        },
      },
      populate: {
        course: {
          populate: {
            artefacts: true,
          },
        },
        lesson: true,
      },
    })) as Question[]
    for (const openQuestion of openQuestions) {
      strapi.log.info(`Processing Question: ${openQuestion.id}, ${openQuestion.question}`)
      try {
        const question = openQuestion.question
        const artefactFilter: { course: number; lesson?: number } = {
          course: openQuestion.course.id,
        }
        if (openQuestion.lesson) artefactFilter.lesson = openQuestion.lesson.id
        const allEmbeddings = (await strapi.entityService.findMany('api::embedding.embedding', {
          filters: {
            artefact: artefactFilter,
          },
          populate: {
            artefact: {
              populate: {
                file: {
                  fields: ['name'],
                },
              },
            },
          },
        })) as Embedding[]
        const questionEmbedding = await getEmbeddings(question)

        const similarityResults = allEmbeddings.map((embedding) => {
          const similarity = cosineSimilarity(questionEmbedding, embedding.embedding)
          return { embedding, similarity }
        })

        const top5KEmbeddings = similarityResults.sort((a, b) => b.similarity - a.similarity).slice(0, 5)
        const embeddingDocuments = top5KEmbeddings.map((e) => e.embedding)
        const context = generateContext(embeddingDocuments)
        const prompt = questionPrompt(context, openQuestion.question)
        strapi.log.info(`Prompt: ${prompt}`)
        const completionText = await completePrompt(prompt)
        if (!completionText) continue
        await strapi.entityService.update('api::question.question', openQuestion.id, { data: { answer: completionText, status: 'done' } })
      } catch (error) {
        strapi.log.error(error)
        await strapi.entityService.update('api::question.question', openQuestion.id, { data: { status: 'done' } })
      }
      strapi.log.info(`Processing Question: ${openQuestion.id}, ${openQuestion.question} - DONE`)
    }
  }
}

const cosineSimilarity = (A: number[], B: number[]) => {
  let dotproduct = 0
  let mA = 0
  let mB = 0
  for (let i = 0; i < A.length; i++) {
    dotproduct += A[i] * B[i]
    mA += A[i] * A[i]
    mB += B[i] * B[i]
  }
  mA = Math.sqrt(mA)
  mB = Math.sqrt(mB)
  const similarity = (dotproduct / mA) * mB
  return similarity
}

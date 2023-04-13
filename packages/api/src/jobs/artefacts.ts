import { resolve } from 'path'
import { Artefact, BullStrapi } from '@teachergpt/common'
import { Job } from 'bullmq'
import { getTextFromPDF } from './pdf'
import { getEmbeddings, getTranscript } from './openai'

export const processArtefacts = (strapi: BullStrapi) => {
  return async (_1: Job) => {
    const openArtefacts = (await strapi.entityService.findMany('api::artefact.artefact', {
      filters: {
        status: 'open',
      },
      populate: {
        file: true,
        pages: true,
        embeddings: true,
      },
    })) as Artefact[]
    const currentFolder = resolve(__dirname)
    for (const openArtefact of openArtefacts) {
      if (!openArtefact.file) continue
      const filePath = resolve(currentFolder, '..', '..', '..', 'public', 'uploads', `${openArtefact.file.hash}${openArtefact.file.ext}`)
      strapi.log.info(`Processing Artefact: ${openArtefact.id}, ${openArtefact.file.name}`)
      try {
        if (openArtefact.file.ext === '.pdf') {
          const pages = await getTextFromPDF(filePath)
          for (const existingPage of openArtefact.pages) {
            await strapi.entityService.delete('api::page.page', existingPage.id)
          }
          for (const existingEmbedding of openArtefact.embeddings) {
            await strapi.entityService.delete('api::embedding.embedding', existingEmbedding.id)
          }
          for (const page of pages) {
            const embedding = await getEmbeddings(page.text)
            const newEmbedding = await strapi.entityService.create('api::embedding.embedding', {
              data: { text: page.text, embedding, artefact: openArtefact.id },
            })
            await strapi.entityService.create('api::page.page', { data: { ...page, artefact: openArtefact.id, embedding: newEmbedding } })
          }
          await strapi.entityService.update('api::artefact.artefact', openArtefact.id, { data: { status: 'done' } })
        }
        if (openArtefact.file.ext === '.m4a' || openArtefact.file.ext === '.mp3') {
          const transcript = await getTranscript(filePath)
          const splittedTranscript = splitStringIntoSubstrings(transcript, 500)
          for (const splittedTrans of splittedTranscript) {
            const embedding = await getEmbeddings(splittedTrans)
            await strapi.entityService.create('api::embedding.embedding', {
              data: { text: splittedTrans, embedding, artefact: openArtefact.id },
            })
          }
          await strapi.entityService.update('api::artefact.artefact', openArtefact.id, { data: { transcript, status: 'done' } })
        }
        strapi.log.info(`Processing Artefact: ${openArtefact.id}, ${openArtefact.file.name} - DONE`)
        strapi.bull.embeddings.add('prcessEmbeddings', undefined, {})
      } catch (error) {
        strapi.log.error(error)
      }
    }
  }
}

const splitStringIntoSubstrings = (inputString: string, maxLength = 250): string[] => {
  const substrings: string[] = []
  let startIndex = 0

  while (startIndex < inputString.length) {
    const endIndex = startIndex + maxLength
    const substring = inputString.slice(startIndex, endIndex)
    substrings.push(substring)
    startIndex = endIndex
  }

  return substrings
}

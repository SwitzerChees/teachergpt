// import { BullStrapi } from '@teachergpt/common'
// import { Job } from 'bullmq'

// export const processEmbeddings = (strapi: BullStrapi) => {
//   return async (_1: Job) => {
//     strapi.log.info('Processing Embeddings')
// const openArtefacts = (await strapi.entityService.findMany('api::artefact.artefact', {
//   filters: {
//     status: 'done',
//   },
//   populate: {
//     file: true,
//     course: true,
//     lesson: true,
//   },
// })) as Artefact[]
// let embeddingCount = 1
// const keys = await strapi.redis.keys('embedding:*')
// strapi.log.info(`Deleting ${keys.length} Embeddings from Redis`)
// for (const key of keys) {
//   await strapi.redis.del(key)
// }
// for (const openArtefact of openArtefacts) {
//   strapi.log.info(`Adding Embeddings to Redis: ${openArtefact.id}, ${openArtefact.file.name}`)
//   if (!openArtefact.embeddings) continue
//   if (!openArtefact.file) continue
//   for (const embedding of openArtefact.embeddings) {
//     strapi.log.info(`Adding Embedding to Redis: ${embeddingCount}`)
//     if (embedding.embedding.length !== 1536) {
//       strapi.log.error(`Embedding has wrong length: ${embedding.embedding.length}`)
//       continue
//     }
//     await strapi.redis.json.set(`embedding:${embeddingCount}`, '.', {
//       transcript: embedding.transcript,
//       embedding: embedding.embedding,
//       source: openArtefact.file.name,
//       courseId: openArtefact.course?.id,
//       lessonId: openArtefact.lesson?.id,
//     })
//     embeddingCount++
//   }
// }
//   }
// }

import { Queue, Worker, QueueOptions } from 'bullmq'
import { BullStrapi, ServerRoles } from '@teachergpt/common'
import { processQuestions, processArtefacts, processSummaries } from '.'

const connectBull = (strapi: BullStrapi) => {
  const {
    redis: { host, port },
    server: { role },
  } = strapi.config
  const defaultQueueOptions = {
    connection: {
      host,
      port,
    },
    defaultJobOptions: {
      attempts: 20,
      timeout: 1000 * 60,
      removeOnComplete: true,
      removeOnFail: false,
    },
  } as QueueOptions
  const questionsQueue = new Queue('questions', {
    ...defaultQueueOptions,
    defaultJobOptions: { ...defaultQueueOptions.defaultJobOptions },
  })
  const artefactsQueue = new Queue('artefacts', {
    ...defaultQueueOptions,
    defaultJobOptions: { ...defaultQueueOptions.defaultJobOptions },
  })
  const summariesQueue = new Queue('summaries', {
    ...defaultQueueOptions,
    defaultJobOptions: { ...defaultQueueOptions.defaultJobOptions },
  })
  const embeddingsQueue = new Queue('embeddings', {
    ...defaultQueueOptions,
    defaultJobOptions: { ...defaultQueueOptions.defaultJobOptions },
  })
  // Only process Queues if the server is a worker or has all roles
  if (role === ServerRoles.All || role === ServerRoles.Worker) {
    const accessCacheWorker = new Worker('questions', processQuestions(strapi), defaultQueueOptions)
    const artefactsWorker = new Worker('artefacts', processArtefacts(strapi), defaultQueueOptions)
    const summariesWorker = new Worker('summaries', processSummaries(strapi), defaultQueueOptions)
    // const embeddingsWorker = new Worker('embeddings', processEmbeddings(strapi), defaultQueueOptions)
    strapi.log.info(`Bull Worker Started: ${accessCacheWorker.name}`)
    strapi.log.info(`Bull Worker Started: ${artefactsWorker.name}`)
    strapi.log.info(`Bull Worker Started: ${summariesWorker.name}`)
    // strapi.log.info(`Bull Worker Started: ${embeddingsWorker.name}`)
  }
  strapi.bull = {
    questions: questionsQueue,
    artefacts: artefactsQueue,
    summaries: summariesQueue,
    embeddings: embeddingsQueue,
  }
  strapi.bull.questions.add('processQuestions', undefined, { repeat: { every: 1000 } })
  strapi.bull.artefacts.add('processArtefacts', undefined, { repeat: { every: 1000 } })
  strapi.bull.summaries.add('processSummaries', undefined, { repeat: { every: 1000 } })
  // strapi.bull.embeddings.add('prcessEmbeddings', undefined, {})
  const url = `redis://${host}:${port}`
  strapi.log.info(`Bull Queue Connected: ${url}`)
}

export { connectBull }

import { Queue, Worker, Job, QueueOptions } from 'bullmq'
import { BullStrapi, Question, ServerRoles } from '@mylearning/common'
import { completePrompt } from './openai'

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
      attempts: 2,
      timeout: 1000 * 60,
      removeOnComplete: true,
      removeOnFail: false,
    },
  } as QueueOptions
  const questionsQueue = new Queue('questions', {
    ...defaultQueueOptions,
    defaultJobOptions: { ...defaultQueueOptions.defaultJobOptions, removeOnFail: true },
  })
  // Only process Queues if the server is a worker or has all roles
  if (role === ServerRoles.All || role === ServerRoles.Worker) {
    const accessCacheWorker = new Worker('questions', processQuestions(strapi), defaultQueueOptions)
    strapi.log.info(`Bull Worker Started: ${accessCacheWorker.name}`)
  }
  strapi.bull = {
    questions: questionsQueue,
  }
  strapi.bull.questions.add('processQuestions', undefined, { repeat: { every: 1000 } })
  const url = `redis://${host}:${port}`
  strapi.log.info(`Bull Queue Connected: ${url}`)
}

const processQuestions = (strapi: BullStrapi) => {
  return async (_1: Job) => {
    const openQuestions = (await strapi.entityService.findMany('api::question.question', {
      filters: {
        status: 'open',
      },
    })) as Question[]
    for (const openQuestion of openQuestions) {
      strapi.log.info(`Processing Question: ${openQuestion.id}, ${openQuestion.question}`)
      const completionText = await completePrompt(openQuestion.question)
      if (!completionText) continue
      await strapi.entityService.update('api::question.question', openQuestion.id, { data: { answer: completionText, status: 'done' } })
    }
  }
}

export { connectBull }

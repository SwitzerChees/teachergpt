import { resolve } from 'path'
import { Queue, Worker, Job, QueueOptions } from 'bullmq'
import { Artefact, BullStrapi, Question, ServerRoles } from '@mylearning/common'
import { completePrompt, getTextFromPDF } from '.'

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
  // Only process Queues if the server is a worker or has all roles
  if (role === ServerRoles.All || role === ServerRoles.Worker) {
    const accessCacheWorker = new Worker('questions', processQuestions(strapi), defaultQueueOptions)
    const artefactsWorker = new Worker('artefacts', processArtefacts(strapi), defaultQueueOptions)
    strapi.log.info(`Bull Worker Started: ${accessCacheWorker.name}`)
    strapi.log.info(`Bull Worker Started: ${artefactsWorker.name}`)
  }
  strapi.bull = {
    questions: questionsQueue,
    artefacts: artefactsQueue,
  }
  strapi.bull.questions.add('processQuestions', undefined, { repeat: { every: 1000 } })
  strapi.bull.artefacts.add('processArtefacts', undefined, { repeat: { every: 1000 } })
  const url = `redis://${host}:${port}`
  strapi.log.info(`Bull Queue Connected: ${url}`)
}

const processQuestions = (strapi: BullStrapi) => {
  return async (_1: Job) => {
    const openQuestions = (await strapi.entityService.findMany('api::question.question', {
      filters: {
        status: 'open',
      },
      populate: {
        course: {
          populate: {
            artefacts: true,
          },
        },
      },
    })) as Question[]
    for (const openQuestion of openQuestions) {
      strapi.log.info(`Processing Question: ${openQuestion.id}, ${openQuestion.question}`)
      const artefacts = openQuestion.course.artefacts
      const transcript = artefacts.map((artefact) => artefact.transcript).join(' ')
      const completionText = await completePrompt(transcript + openQuestion.question)
      if (!completionText) continue
      await strapi.entityService.update('api::question.question', openQuestion.id, { data: { answer: completionText, status: 'done' } })
    }
  }
}

const processArtefacts = (strapi: BullStrapi) => {
  return async (_1: Job) => {
    const openArtefacts = (await strapi.entityService.findMany('api::artefact.artefact', {
      filters: {
        status: 'open',
      },
      populate: {
        file: true,
      },
    })) as Artefact[]
    const currentFolder = resolve(__dirname)
    for (const openArtefact of openArtefacts) {
      if (!openArtefact.file) continue
      if (openArtefact.file.ext !== '.pdf') continue
      const filePath = resolve(currentFolder, '..', '..', '..', 'public', 'uploads', `${openArtefact.file.hash}${openArtefact.file.ext}`)
      strapi.log.info(`Processing Artefact: ${openArtefact.id}, ${openArtefact.file.name}`)
      const textFromPDF = await getTextFromPDF(filePath)
      if (!textFromPDF) continue
      await strapi.entityService.update('api::artefact.artefact', openArtefact.id, { data: { transcript: textFromPDF, status: 'done' } })
    }
  }
}

export { connectBull }

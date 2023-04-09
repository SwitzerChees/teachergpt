import { resolve } from 'path'
import { Queue, Worker, Job, QueueOptions } from 'bullmq'
import { Artefact, BullStrapi, Course, Lesson, Question, ServerRoles } from '@teachergpt/common'
import { completePrompt, getEmbeddings, getTextFromPDF, getTranscript, questionPrompt } from '.'

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
    const embeddingsWorker = new Worker('embeddings', processEmbeddings(strapi), defaultQueueOptions)
    strapi.log.info(`Bull Worker Started: ${accessCacheWorker.name}`)
    strapi.log.info(`Bull Worker Started: ${artefactsWorker.name}`)
    strapi.log.info(`Bull Worker Started: ${summariesWorker.name}`)
    strapi.log.info(`Bull Worker Started: ${embeddingsWorker.name}`)
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
  strapi.bull.embeddings.add('prcessEmbeddings', undefined, {})
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
      // const artefacts = openQuestion.course.artefacts.filter((artefact) => artefact.id === 4)
      // const transcript = artefacts.map((artefact) => artefact.transcript).join(' ')
      const prompt = questionPrompt('', openQuestion.question)
      const completionText = await completePrompt(prompt)
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
      let transcript = ''
      const filePath = resolve(currentFolder, '..', '..', '..', 'public', 'uploads', `${openArtefact.file.hash}${openArtefact.file.ext}`)
      strapi.log.info(`Processing Artefact: ${openArtefact.id}, ${openArtefact.file.name}`)
      strapi.log.info(`Create Transcript: ${filePath}`)
      switch (openArtefact.file.ext) {
        case '.pdf': {
          transcript = await getTextFromPDF(filePath)
          break
        }
        case '.m4a':
          transcript = await getTranscript(filePath)
          break
        case '.mp3':
          transcript = await getTranscript(filePath)
          break
      }
      if (!transcript) continue
      strapi.log.info(`Create Embeddings: ${filePath}`)
      const splittedTranscript = splitStringIntoSubstrings(openArtefact.transcript)
      const embeddings: { transcript: string; embedding: number[] }[] = []
      for (const splittedTrans of splittedTranscript) {
        const embedding = await getEmbeddings(splittedTrans)
        if (embedding) embeddings.push({ transcript: splittedTrans, embedding })
      }
      strapi.bull.embeddings.add('prcessEmbeddings', undefined, {})
      await strapi.entityService.update('api::artefact.artefact', openArtefact.id, { data: { transcript, embeddings, status: 'done' } })
    }
  }
}

const processSummaries = (strapi: BullStrapi) => {
  return async (_1: Job) => {
    const openCourses = (await strapi.entityService.findMany('api::course.course', {
      filters: {
        status: 'open',
      },
      populate: {
        artefacts: true,
      },
    })) as Course[]
    for (const openCourse of openCourses) {
      strapi.log.info(`Processing Course: ${openCourse.id}, ${openCourse.name}`)
      const artefacts = openCourse.artefacts
      const transcript = artefacts.map((artefact) => artefact.transcript).join(' ')
      const summaryText = await completePrompt(transcript + '\n Fasse diesen Text zusammen und gib die wichtigsten Erkenntnisse zurück.')
      await strapi.entityService.update('api::course.course', openCourse.id, { data: { summary: summaryText, status: 'done' } })
    }
    const openLessons = (await strapi.entityService.findMany('api::lesson.lesson', {
      filters: {
        status: 'open',
      },
      populate: {
        artefacts: true,
      },
    })) as Lesson[]
    for (const openLesson of openLessons) {
      strapi.log.info(`Processing Lesson: ${openLesson.id}, ${openLesson.title}`)
      const artefacts = openLesson.artefacts
      const transcript = artefacts.map((artefact) => artefact.transcript).join(' ')
      const summaryText = await completePrompt(transcript + '\n Fasse diesen Text zusammen und gib die wichtigsten Erkenntnisse zurück.')
      await strapi.entityService.update('api::lesson.lesson', openLesson.id, { data: { summary: summaryText, status: 'done' } })
    }
  }
}

const processEmbeddings = (strapi: BullStrapi) => {
  return async (_1: Job) => {
    const openArtefacts = (await strapi.entityService.findMany('api::artefact.artefact', {
      filters: {
        status: 'done',
      },
      populate: {
        file: true,
        course: true,
        lesson: true,
      },
    })) as Artefact[]
    let embeddingCount = 1
    for (const openArtefact of openArtefacts) {
      strapi.log.info(`Processing Embeddings: ${openArtefact.id}`)
      if (!openArtefact.file) continue
      if (!openArtefact.transcript) continue
      if (!openArtefact.embeddings) continue
      for (const embedding of openArtefact.embeddings) {
        strapi.redis.json.set(`embedding::${embeddingCount}`, '.', embedding)
        embeddingCount++
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

export { connectBull }

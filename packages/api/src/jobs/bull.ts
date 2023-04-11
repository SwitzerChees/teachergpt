import { resolve } from 'path'
import { Queue, Worker, Job, QueueOptions } from 'bullmq'
import { Artefact, BullStrapi, Course, EmbeddingDocument, Lesson, PDFPage, Question, ServerRoles } from '@teachergpt/common'
import { completePrompt, generateContext, getEmbeddings, getTextFromPDF, getTranscript, questionPrompt } from '.'

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
        lesson: true,
      },
    })) as Question[]
    for (const openQuestion of openQuestions) {
      strapi.log.info(`Processing Question: ${openQuestion.id}, ${openQuestion.question}`)
      const question = openQuestion.question
      const questionEmbedding = await getEmbeddings(question)
      const primarySearchQuery = openQuestion.lesson
        ? `(@courseId:[${openQuestion.course.id} ${openQuestion.course.id}] @lessonId:[${openQuestion.lesson.id} ${openQuestion.lesson.id}])`
        : `(@courseId:[${openQuestion.course.id} ${openQuestion.course.id}])`
      const searchQuery = `${primarySearchQuery}=>[KNN 5 @embedding $blob AS dist]`
      const float32Embedding = new Float32Array(questionEmbedding)
      const embeddingBuffer = Buffer.from(float32Embedding.buffer)
      const result = await strapi.redis.ft.search('idx:artefacts', searchQuery, {
        SORTBY: 'dist',
        PARAMS: {
          blob: embeddingBuffer,
        },
        DIALECT: 2,
      })
      const embeddingDocuments = result.documents.map((d) => d.value as unknown as EmbeddingDocument)
      const context = generateContext(embeddingDocuments)
      const prompt = questionPrompt(context, openQuestion.question)
      strapi.log.info(`Prompt: ${prompt}`)
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
      const filePath = resolve(currentFolder, '..', '..', '..', 'public', 'uploads', `${openArtefact.file.hash}${openArtefact.file.ext}`)
      strapi.log.info(`Processing Artefact: ${openArtefact.id}, ${openArtefact.file.name}`)
      strapi.log.info(`Create Transcript: ${filePath}`)
      const enrichPayload: { transcript: string; embeddings: { transcript: string; embedding: number[] }[]; pages: PDFPage[] } = {
        transcript: '',
        embeddings: [],
        pages: [],
      }
      switch (openArtefact.file.ext) {
        case '.pdf':
          enrichPayload.pages = await getTextFromPDF(filePath)
          break
        case '.m4a':
          enrichPayload.transcript = await getTranscript(filePath)
          break
        case '.mp3':
          enrichPayload.transcript = await getTranscript(filePath)
          break
      }
      strapi.log.info(`Create Embeddings: ${filePath}`)
      if (enrichPayload.transcript) {
        const splittedTranscript = splitStringIntoSubstrings(openArtefact.transcript, 500)
        for (const splittedTrans of splittedTranscript) {
          const embedding = await getEmbeddings(splittedTrans)
          if (embedding) enrichPayload.embeddings.push({ transcript: splittedTrans, embedding })
        }
      } else if (enrichPayload.pages.length > 0) {
        for (const page of enrichPayload.pages) {
          const embedding = await getEmbeddings(page.text)
          if (embedding) enrichPayload.embeddings.push({ transcript: page.text, embedding })
        }
      }
      await strapi.entityService.update('api::artefact.artefact', openArtefact.id, { data: { ...enrichPayload, status: 'done' } })
      strapi.bull.embeddings.add('prcessEmbeddings', undefined, {})
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
    const keys = await strapi.redis.keys('embedding:*')
    for (const key of keys) {
      await strapi.redis.del(key)
    }
    for (const openArtefact of openArtefacts) {
      strapi.log.info(`Processing Embeddings: ${openArtefact.id}`)
      if (!openArtefact.embeddings) continue
      if (!openArtefact.file) continue
      for (const embedding of openArtefact.embeddings) {
        await strapi.redis.json.set(`embedding:${embeddingCount}`, '.', {
          transcript: embedding.transcript,
          embedding: embedding.embedding,
          source: openArtefact.file.name,
          courseId: openArtefact.course?.id,
          lessonId: openArtefact.lesson?.id,
        })
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

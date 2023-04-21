import { BullStrapi, Course, Lesson, ProcessingStates } from '@teachergpt/common'
import { Job } from 'bullmq'
import { completePrompt } from './openai'

export const processSummaries = (strapi: BullStrapi) => {
  return async (_1: Job) => {
    const openCourses = (await strapi.entityService.findMany('api::course.course', {
      filters: {
        status: ProcessingStates.Open,
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
      await strapi.entityService.update('api::course.course', openCourse.id, {
        data: { summary: summaryText, status: ProcessingStates.Done },
      })
    }
    const openLessons = (await strapi.entityService.findMany('api::lesson.lesson', {
      filters: {
        status: ProcessingStates.Open,
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
      await strapi.entityService.update('api::lesson.lesson', openLesson.id, {
        data: { summary: summaryText, status: ProcessingStates.Done },
      })
    }
  }
}

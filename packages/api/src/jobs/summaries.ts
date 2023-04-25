import { Artefact, BullStrapi, Course, Lesson, ProcessingStates } from '@teachergpt/common'
import { Job } from 'bullmq'
import { completePrompt, summarySystemMessage } from './openai'
import { generateArtefactConext, summaryPrompt } from './prompts'

export const processSummaries = (strapi: BullStrapi) => {
  return async (_1: Job) => {
    const openCourses = (await strapi.entityService.findMany('api::course.course', {
      filters: {
        status: ProcessingStates.Open,
      },
      populate: {
        artefacts: {
          populate: {
            file: true,
            pages: true,
          },
        },
      },
    })) as Course[]
    for (const openCourse of openCourses) {
      strapi.log.info(`Processing Course: ${openCourse.id}, ${openCourse.name}`)
      const completionText = await artefactsToSummary(openCourse.artefacts)
      await strapi.entityService.update('api::course.course', openCourse.id, {
        data: { summary: completionText, status: ProcessingStates.Done },
      })
    }
    const openLessons = (await strapi.entityService.findMany('api::lesson.lesson', {
      filters: {
        status: ProcessingStates.Open,
      },
      populate: {
        artefacts: {
          populate: {
            file: true,
            pages: true,
          },
        },
      },
    })) as Lesson[]
    for (const openLesson of openLessons) {
      strapi.log.info(`Processing Lesson: ${openLesson.id}, ${openLesson.title}`)
      const completionText = await artefactsToSummary(openLesson.artefacts)
      await strapi.entityService.update('api::lesson.lesson', openLesson.id, {
        data: { summary: completionText, status: ProcessingStates.Done },
      })
      strapi.log.info(`Lesson: ${openLesson.id}, ${openLesson.title} completed`)
    }
  }
}

const artefactsToSummary = async (artefacts: Artefact[]) => {
  const context = generateArtefactConext(artefacts)
  const prompt = summaryPrompt(context)
  return await completePrompt(summarySystemMessage, prompt)
}

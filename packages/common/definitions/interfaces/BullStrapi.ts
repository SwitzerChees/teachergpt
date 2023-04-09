import { Strapi } from '@strapi/strapi'
import { Queue } from 'bullmq'
import { RedisClientType } from 'redis'

interface BullStrapi extends Strapi {
  redis: RedisClientType
  redisSubscribe: RedisClientType
  bull: {
    questions: Queue
    artefacts: Queue
    summaries: Queue
  }
  t: (key: string, locale: string) => string
}

export { BullStrapi }

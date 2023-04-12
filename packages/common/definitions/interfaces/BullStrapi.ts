import { Strapi } from '@strapi/strapi'
import { Queue } from 'bullmq'
import { RedisClientType } from 'redis'
import { WeaviateClient } from 'weaviate-ts-client'
import { MilvusClient } from '@zilliz/milvus2-sdk-node'

interface BullStrapi extends Strapi {
  redis: RedisClientType
  redisSubscribe: RedisClientType
  weaviate: WeaviateClient
  milvus: MilvusClient
  bull: {
    questions: Queue
    artefacts: Queue
    summaries: Queue
    embeddings: Queue
  }
  t: (key: string, locale: string) => string
}

export { BullStrapi }

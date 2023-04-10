import { createClient, RedisClientType, SchemaFieldTypes, VectorAlgorithms } from 'redis'
import { BullStrapi } from '@teachergpt/common'

const connectRedis = async (strapi: BullStrapi) => {
  const {
    redis: { host, port },
  } = strapi.config
  const url = `redis://${host}:${port}`
  const onRedisError = (err: Error) => {
    // If redis crashes exit strapi with exit code 1
    if (err.message.toLowerCase().includes('socket closed')) {
      strapi.log.error('Redis Crashed or is Unreachable, Shutdown Strapi to allow clean Restart')
      process.exit(1)
    }
  }
  const client = createClient({ url }) as RedisClientType
  client.on('error', onRedisError)
  await client.connect()
  strapi.redis = client
  const clientSubscribe = createClient({ url }) as RedisClientType
  clientSubscribe.on('error', onRedisError)
  await clientSubscribe.connect()
  strapi.redisSubscribe = clientSubscribe
  let indexExists = true
  try {
    await strapi.redis.ft.info('idx:artefacts')
  } catch (error) {
    indexExists = false
    strapi.log.error(error)
  }

  // await strapi.redis.ft.dropIndex('idx:artefacts')
  if (!indexExists) {
    await strapi.redis.ft.create(
      'idx:artefacts',
      {
        '$.courseId': {
          type: SchemaFieldTypes.NUMERIC,
          AS: 'courseId',
        },
        '$.lessonId': {
          type: SchemaFieldTypes.NUMERIC,
          AS: 'lessonId',
        },
        '$.transcript': {
          type: SchemaFieldTypes.TEXT,
          AS: 'transcript',
        },
        '$.source': {
          type: SchemaFieldTypes.TEXT,
          AS: 'source',
        },
        '$.embedding': {
          type: SchemaFieldTypes.VECTOR,
          ALGORITHM: VectorAlgorithms.HNSW,
          DIM: 1536,
          TYPE: 'FLOAT32',
          DISTANCE_METRIC: 'L2',
          AS: 'embedding',
        },
      },
      {
        ON: 'JSON',
        PREFIX: 'embedding:',
      }
    )
  }

  strapi.log.info(`Redis Connected: ${url}`)
}

export { connectRedis }

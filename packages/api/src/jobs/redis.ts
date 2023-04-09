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
  try {
    const existingIndexes = await strapi.redis.ft.info('idx:artefacts')
    if (existingIndexes) {
      await strapi.redis.ft.dropIndex('idx:artefacts')
    }
  } catch (error) {
    strapi.log.error(error)
  }
  await strapi.redis.ft.create(
    'idx:artefacts',
    {
      '$.transcript': {
        type: SchemaFieldTypes.TEXT,
      },
      '$.embedding': {
        type: SchemaFieldTypes.VECTOR,
        ALGORITHM: VectorAlgorithms.HNSW,
        DIM: 1536,
        TYPE: 'FLOAT32',
        DISTANCE_METRIC: 'L2',
      },
    },
    {
      ON: 'JSON',
      PREFIX: 'embedding:',
    }
  )
  // try {
  //   const testResult = await searchVectors(strapi, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
  //   console.log(testResult)
  // } catch (error) {
  //   strapi.log.error(error)
  // }
  strapi.log.info(`Redis Connected: ${url}`)
}

const createRedisQuery = (queryVector: number[], topK: number): string => {
  const vectorString = queryVector.map((val) => val.toString()).join(' ')
  return `@embedding:[(${vectorString}) TOPK ${topK}]`
}

export const searchVectors = async (strapi: BullStrapi, queryVector: number[], topK = 5) => {
  const baseQuery = createRedisQuery(queryVector, topK)
  return await strapi.redis.ft.search('idx:documents', baseQuery, {})
}

export { connectRedis }

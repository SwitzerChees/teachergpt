import { BullStrapi } from '@teachergpt/common'
import { MilvusClient } from '@zilliz/milvus2-sdk-node'

const connectMilvus = async (strapi: BullStrapi) => {
  const {
    milvus: { host, port },
  } = strapi.config
  const url = `${host}:${port}`
  strapi.milvus = new MilvusClient(url)

  const params = {
    collection_name: 'embedding',
    fields: [
      {
        name: 'id',
        description: '',
        data_type: 5,
        is_primary_key: true,
      },
      {
        name: 'transcript',
        description: '',
        data_type: 21,
        type_params: {
          max_length: '2000',
        },
      },
      {
        name: 'embedding',
        description: '',
        data_type: 101,
        type_params: {
          dim: '1536',
        },
      },
      {
        name: 'source',
        description: '',
        data_type: 21,
        type_params: {
          max_length: '200',
        },
      },
      {
        name: 'courseId',
        description: '',
        data_type: 5,
      },
      {
        name: 'lessonId',
        description: '',
        data_type: 5,
      },
    ],
  }
  try {
    const result = await strapi.milvus.collectionManager.createCollection(params as any)
    strapi.log.info(result)
    const loaded = await strapi.milvus.collectionManager.loadCollection({
      collection_name: 'embedding',
    })
  } catch (error) {
    strapi.log.error(error)
  }

  strapi.log.info(`Milvus Connected: ${url}`)
}

export { connectMilvus }

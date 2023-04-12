import { BullStrapi } from '@teachergpt/common'
import weaviate from 'weaviate-ts-client'

const connectWeaviate = async (strapi: BullStrapi) => {
  const {
    weaviate: { scheme, host, port },
  } = strapi.config
  const client = weaviate.client({
    scheme,
    host: `${host}:${port}`,
  })
  strapi.weaviate = client

  const className = 'Embedding'

  const schemaConfig = {
    class: className,
    vectorizer: 'text2vec-transformers',
    vectorIndexType: 'hnsw',
    properties: [
      {
        name: 'transcript',
        dataType: ['string'],
        moduleConfig: {
          'text2vec-transformers': {
            skip: false,
          },
        },
      },
      {
        name: 'embedding',
        dataType: ['number[]'],
      },
      {
        name: 'source',
        dataType: ['string'],
      },
      {
        name: 'courseId',
        dataType: ['number'],
      },
      {
        name: 'lessonId',
        dataType: ['number'],
      },
    ],
  }

  const schemaRes = await client.schema.getter().do()

  // const classExists = schemaRes.classes.find((c) => c.class === className)
  // if (classExists) {
  //   strapi.log.info(`Class ${className} already exists delete it first`)
  //   await client.schema.classDeleter().withClassName(className).do()
  // }
  // await client.schema.classCreator().withClass(schemaConfig).do()

  strapi.log.info(`Weaviate Connected: ${scheme}://${host}:${port}`)
}

export { connectWeaviate }

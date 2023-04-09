import _ from 'lodash'
import { TransformerOptions } from '@teachergpt/common/definitions'

const removeObjectKey = (object: any, key: string) => ({
  id: object.id,
  ...object[key],
})

export const useTransformer = () => {
  const transformResponse = <T>(data: any, customOptions?: TransformerOptions): T => {
    const options: TransformerOptions = {
      removeAttributesKey: customOptions?.removeAttributesKey ?? true,
      removeDataKey: customOptions?.removeDataKey ?? true,
      removeMeta: customOptions?.removeMeta ?? true,
    }
    if (_.has(data, 'data') && _.has(data, 'meta')) {
      data = _.cloneDeep(data) as T
      if (options.removeMeta) {
        data = data.data
      }
    }
    // removeAttributeKey specific transformations
    if (options.removeAttributesKey) {
      // single
      if (_.has(data, 'attributes')) {
        return transformResponse(removeObjectKey(data, 'attributes'), customOptions)
      }

      // collection
      if (_.isArray(data) && data.length && _.has(_.head(data), 'attributes')) {
        return data.map((e) => transformResponse(e), customOptions) as T
      }
    }

    // fields
    _.forEach(data, (value, key) => {
      if (!value) {
        return
      }

      // removeDataKey specific transformations
      if (options.removeDataKey) {
        // single
        if (_.isObject(value)) {
          data[key] = transformResponse(value, customOptions)
        }

        // many
        if (_.isArray(value)) {
          data[key] = value.map((field) => transformResponse(field, customOptions))
        }
      }

      // relation(s)
      if (_.has(value, 'data')) {
        let relation = null
        // single
        if (_.isObject(value.data)) {
          relation = transformResponse(value.data, customOptions)
        }

        // many
        if (_.isArray(value.data)) {
          relation = value.data.map((e: any) => transformResponse(e, customOptions))
        }

        if (options.removeDataKey) {
          data[key] = relation
        } else {
          data[key].data = relation
        }
      }

      // single component
      if (_.has(value, 'id')) {
        data[key] = transformResponse(value, customOptions)
      }

      // repeatable component & dynamic zone
      if (_.isArray(value) && _.has(_.head(value), 'id')) {
        data[key] = value.map((p) => transformResponse(p, customOptions))
      }

      // single media
      if (_.has(value, 'provider')) {
        return
      }

      // multi media
      if (_.isArray(value) && _.has(_.head(value), 'provider')) {
        return
      }
    })

    return data
  }

  return { transformResponse }
}

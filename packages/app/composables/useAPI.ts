import { APIOptions, APIResponse, Severities } from '@teachergpt/common/definitions'
import { HttpStatusCode } from 'axios'

export const useAPI = () => {
  const { addNotification } = useNotificationsStore()
  const getSafeAPIResponse = async <T>(request: Promise<unknown>, customOptions?: APIOptions): Promise<APIResponse<T>> => {
    const options: APIOptions = {
      transform: customOptions?.transform ?? true,
      transformerOptions: customOptions?.transformerOptions,
    }
    try {
      const response = await request
      if (options.transform) {
        const { transformResponse } = useTransformer()
        return {
          ok: true,
          status: HttpStatusCode.Ok,
          result: transformResponse<T>(response, options.transformerOptions),
        }
      }
      return {
        ok: true,
        status: HttpStatusCode.Ok,
        result: response as T,
      }
    } catch (err: any) {
      if (err?.error?.status === HttpStatusCode.BadRequest && err?.error?.message && addNotification) {
        addNotification({ life: 7000, severity: Severities.Error, summary: 'error', detail: err.error.message })
      }
      return {
        ok: false,
        status: (err?.error?.status as HttpStatusCode) || HttpStatusCode.InternalServerError,
        result: null as T,
      }
    }
  }

  return { getSafeAPIResponse }
}

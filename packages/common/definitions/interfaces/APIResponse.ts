import { HttpStatusCode } from 'axios'

interface APIResponse<T> {
  ok: boolean
  status: HttpStatusCode
  result: T
}

export { APIResponse }

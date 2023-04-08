import { Question, StrapiObject } from '.'

interface User extends StrapiObject {
  username: string
  email: string
  provider: string
  password: string
  resetPasswordToken?: string
  confirmationToken?: string
  confirmed: boolean
  blocked: boolean
  emailToken?: string
  emailTokenCreatedAt?: Date
  smsToken?: string
  smsTokenCreatedAt?: Date
  question: Question[]
}

export { User }

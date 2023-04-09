import { readFileSync, existsSync } from 'fs'
import pdf from 'pdf-parse'

export const getTextFromPDF = async (path: string) => {
  try {
    if (!existsSync(path)) return ''
    const dataBuffer = await readFileSync(path)
    const data = await pdf(dataBuffer)
    return data.text
  } catch (error) {
    strapi.log.error(error)
    return ''
  }
}

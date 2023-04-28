import { existsSync, readFileSync } from 'fs'
import axios from 'axios'
import FormData from 'form-data'
import { transcriptPromt } from './prompts'
import { convertM4AtoMP3, deleteFiles } from './ffmpeg'

export const getTranscript = async (path: string): Promise<string> => {
  if (!existsSync(path)) return ''
  try {
    let audioFilePath = path
    if (audioFilePath.endsWith('.m4a')) {
      audioFilePath = await convertM4AtoMP3(path)
      if (!existsSync(audioFilePath)) return ''
    }
    const fileBuffer = readFileSync(audioFilePath)
    const formData = new FormData()
    const fileName = path.split('/').pop()
    formData.append('audio_file', fileBuffer, {
      filename: fileName,
    })
    const baseURL = process.env.WHISPER_URL || 'http://localhost:9000'
    const start = Date.now()
    strapi.log.info(`Transcribing ${fileName}...`)
    const response = await axios.post(`${baseURL}/asr`, formData, {
      params: {
        method: 'openai-whisper',
        task: 'transcribe',
        language: 'de',
        initial_prompt: transcriptPromt,
        encode: true,
        output: 'txt',
      },
    })
    const duration = Date.now() - start
    strapi.log.info(`Transcribed ${fileName} in ${duration / 1000}s`)
    if (audioFilePath !== path) await deleteFiles([audioFilePath])
    return response.data as string
  } catch (error) {
    strapi.log.error(error)
    return ''
  }
}

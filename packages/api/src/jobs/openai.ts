import { existsSync, createReadStream } from 'fs'
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai'
import { generateQuestionSystemMessage, generateSummarySystemMessage, transcriptPromt } from './prompts'
import { deleteFiles, segmentAudio } from './segment-audio'
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export const questionSystemMessage: ChatCompletionRequestMessage[] = [
  {
    role: 'system',
    content: generateQuestionSystemMessage(),
  },
]

export const summarySystemMessage: ChatCompletionRequestMessage[] = [
  {
    role: 'system',
    content: generateSummarySystemMessage(),
  },
]

export const completePrompt = async (systemMessage: ChatCompletionRequestMessage[], prompt: string) => {
  try {
    strapi.log.info('Use OpenAI to complete prompt...')
    const completion = await openai.createChatCompletion({
      model: process.env.OPENAI_GPT_MODEL || 'gpt-3.5-turbo', // gpt-4-0314
      messages: [...systemMessage, { role: 'user', content: prompt }],
    })
    const completionText = completion.data.choices[0].message.content
    return completionText
  } catch (error) {
    strapi.log.error(error)
  }
}

export const getTranscript = async (path: string) => {
  if (!existsSync(path)) return ''
  try {
    const audioFilePaths = await segmentAudio({
      inputFile: path,
      segmentTimeSeconds: 60,
    })
    strapi.log.info('Use OpenAI to transcribe audio...')
    const openai = new OpenAIApi(configuration)
    let transcript = ''
    let lastTranscript = transcriptPromt
    for (const audioFilePath of audioFilePaths) {
      const audioFile = createReadStream(audioFilePath)
      const response = await openai.createTranscription(
        audioFile, // The audio file to transcribe.
        process.env.OPENAI_WHISPER_MODEL || 'whisper-1', // The model to use for transcription.
        lastTranscript, // The prompt to use for transcription.
        'json', // The format of the transcription.
        0, // Temperature
        'de' // Language
      )
      lastTranscript = response.data.text
      transcript += lastTranscript
    }
    deleteFiles(audioFilePaths)
    return transcript
  } catch (error) {
    strapi.log.error(error)
    return ''
  }
}

export const getEmbeddings = async (text: string) => {
  try {
    strapi.log.info('Use OpenAI to get embeddings...')
    const openai = new OpenAIApi(configuration)
    const response = await openai.createEmbedding({
      model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
      input: text,
    })
    return response.data.data[0].embedding
  } catch (error) {
    strapi.log.error(error)
    return []
  }
}

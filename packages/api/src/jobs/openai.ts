import { existsSync, createReadStream } from 'fs'
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai'
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

const systemMessage: ChatCompletionRequestMessage[] = [
  {
    role: 'system',
    content:
      'Du bist TeacherGPT. Ein superstarkes Sprachmodell, das Schülern helfen soll, Antworten auf ihre Fragen zu finden. Du antwortest immer mit Markdown, um die Antwort ordnungsgemäß formatieren zu können.',
  },
]

export const completePrompt = async (prompt: string) => {
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4-0314',
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
    const openai = new OpenAIApi(configuration)
    const audioFile = createReadStream(path)
    const response = await openai.createTranscription(
      audioFile, // The audio file to transcribe.
      'whisper-1', // The model to use for transcription.
      undefined, // The prompt to use for transcription.
      'json', // The format of the transcription.
      1, // Temperature
      'de' // Language
    )
    return response.data.text
  } catch (error) {
    strapi.log.error(error)
    return ''
  }
}

export const getEmbeddings = async (text: string) => {
  try {
    const openai = new OpenAIApi(configuration)
    const response = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: text,
    })
    return response.data.data[0].embedding
  } catch (error) {
    strapi.log.error(error)
    return ''
  }
}

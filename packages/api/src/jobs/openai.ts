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

const markdownSystemMessage = ', formatiere die Antwort bitte mit Markdown und verwende Aufzählungen.'

export const completePrompt = async (prompt: string) => {
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4-0314',
      messages: [...systemMessage, { role: 'user', content: `${prompt}${markdownSystemMessage}` }],
    })
    const completionText = completion.data.choices[0].message.content
    return completionText
  } catch (error) {
    strapi.log.error(error)
  }
}

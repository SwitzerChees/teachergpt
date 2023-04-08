import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai'
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

const systemMessage: ChatCompletionRequestMessage[] = [
  { role: 'system', content: "Hi! I'm a bot. I'm here to help you with your questions." },
]

export const completePrompt = async (prompt: string) => {
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [...systemMessage, { role: 'user', content: prompt }],
    })
    const completionText = completion.data.choices[0].message.content
    return completionText
  } catch (error) {
    strapi.log.error(error)
  }
}

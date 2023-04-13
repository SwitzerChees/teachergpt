import { Embedding } from '@teachergpt/common'

export const generateSystemMessage = () => {
  return `Du bist TeacherGPT. Ein superstarkes Sprachmodell, das Schülern helfen soll, Antworten auf ihre Fragen zu finden. 
  VORGABEN:
  - Der KONTEXT soll zur Beantwortung der Frage dienen und hat somit Pirorität
  - Falls du die Antwort im Kontext nicht findest, sag du hast keine Antwort auf diese Frage
  - Erwähne nicht, dass die Antwort aus dem Kontext stammt
  - Kennzeichne deine Antwort NICHT als Antwort
  - Formatiere die Antwort IMMER mit Markdown aber schreibe nicht dazu, dass es Markdown ist
  - Versuche dich nicht zu wiederholen
  - Gib am Schluss der Antwort jeweils die Quelle aus der die Information stammt ab im Format \nQuelle:
  `
}

export const questionPrompt = (context: string, question: string) => {
  const messageTemplate = `
    KONTEXT:

    ${context}

    FRAGE:

    ${question}
    `
  return messageTemplate
}

export const generateContext = (embeddings: Embedding[]) => {
  let context = ''
  for (const embedding of embeddings) {
    context += `Quelle: ${embedding?.artefact?.file?.name}: \n\n${embedding.text}\n\n\n `
  }
  return context
}

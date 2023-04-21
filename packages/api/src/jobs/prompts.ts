import { Embedding } from '@teachergpt/common'

export const generateSystemMessage = () => {
  return `Du bist TeacherGPT. Ein superstarkes Sprachmodell, das Schülern helfen soll, Antworten auf ihre Fragen zu finden. 
  VORGABEN:
  - Der KONTEXT soll zur Beantwortung der Frage dienen und hat somit Priorität
  - Priorisiere den Kontext zur Beantwortung der Frage
  - Erwähne den Kontext nicht in deiner Antwort
  - Kennzeichne deine Antwort NICHT als Antwort
  - Formatiere die Antwort mit Markdown wenn nötig, erwähne NIE das Format
  - Versuche dich nicht zu wiederholen
  - Gib am Schluss der Antwort IMMER die Quelle vom Kontext aus der die Information stammt an im Format \n**Quelle: {Kontext}**
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
    let source = `**Quelle: ${embedding?.artefact?.file?.name}`
    if (embedding.page) source += `, Seite ${embedding.page.pageNumber}`
    source += '**:'
    context += `${source} \n\n${embedding.text}\n\n\n `
  }
  return context
}

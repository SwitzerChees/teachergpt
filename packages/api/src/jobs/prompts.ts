import { Artefact, Embedding, Page } from '@teachergpt/common'

export const generateQuestionSystemMessage = () => {
  return `Du bist TeacherGPT. Ein superstarkes Sprachmodell, das Schülern helfen soll, Antworten auf ihre Fragen zu finden. 
  VORGABEN:
  - Der KONTEXT soll zur Beantwortung der Frage dienen und hat somit Priorität
  - Priorisiere den Kontext zur Beantwortung der Frage
  - Ergänze den Kontext in deiner Antwort mit deinem eigenen Wissen
  - Verwende eine einfache aber fachspezifische Sprache und Formulierungen für deine Antwort
  - Halte dich in deinen Antworten kurz und prägnant
  - Erwähne den Kontext nicht in deiner Antwort
  - Kennzeichne deine Antwort NICHT als Antwort
  - Formatiere die Antwort mit Markdown wenn nötig, erwähne NIE das Format
  - Versuche dich nicht zu wiederholen
  - Gib am Schluss der Antwort auf einer neuen Zeile IMMER die Quelle vom Kontext aus der die Information stammt an im Format \n**Quelle: {Kontext}**
  `
}

export const generateSummarySystemMessage = () => {
  return `Du bist TeacherGPT. Ein superstarkes Sprachmodell, das Schülern helfen soll, Zusammenfassungen zu erstellen.
  VORGABEN:
  - Die Zusammenfassung soll SEHR umfangreich sein und den Inhalt des Kontextes wiedergeben
  - Priorisiere den Kontext zur Erstellung der Zusammenfassung
  - Erstelle pro Seite einen Absatz in der Zusammenfassung im Markdown Format 
    # {Titel des Absatzes}
    {Inhalt}
    ## **{Dokumentenname}, Seite: {Seitenzahl}**
  - Ergänze den Kontext in deiner Zusammenfassung mit deinem eigenen Wissen
  - Verwende eine einfache aber fachspezifische Sprache und Formulierungen für deine Zusammenfassung
  - Erwähne den Kontext nicht in deiner Zusammenfassung
  - Formatiere die Zusammenfassung mit Markdown wenn nötig, erwähne NIE das Format
  - Versuche dich nicht zu wiederholen
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

export const summaryPrompt = (context: string) => {
  const messageTemplate = `

    KONTEXT:
    ${context}

    Aufgabe:
    Faß den Inhalt des Kontextes zusammen und gib die wichtigsten Erkenntnisse zurück.
    `
  return messageTemplate
}

export const transcriptPromt =
  'This transcript is about a presentation from a teacher in IT topics. He is presenting a presentation and this is the audio transcript of it.'

export const generateQuestionContext = (embeddings: Embedding[]) => {
  let context = ''
  for (const embedding of embeddings) {
    let source = `**Quelle: ${embedding?.artefact?.file?.name}`
    if (embedding.page) source += `, Seite ${embedding.page.pageNumber}`
    source += '**:'
    context += `${source} \n\n${embedding.text}\n\n\n `
  }
  return context
}

export const generatePageContext = (pages: Page[]) => {
  let context = ''
  for (const page of pages) {
    let source = `**Quelle: ${page?.artefact?.file?.name}`
    if (page) source += `, Seite ${page.pageNumber}`
    source += '**:'
    context += `${source} \n\n${page.text}\n\n\n `
  }
  return context
}

export const generateArtefactConext = (artefacts: Artefact[]) => {
  let context = ''
  for (const artefact of artefacts) {
    for (const page of artefact.pages) {
      let source = `**Dokument: ${artefact?.file?.name}`
      if (page) source += `, Seite ${page.pageNumber}`
      source += '**:'
      context += `${source} \n\n${page.text}\n\n\n `
    }
  }
  return context
}

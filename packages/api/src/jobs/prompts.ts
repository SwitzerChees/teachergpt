export const questionPrompt = (context: string, question: string) => {
  const messageTemplate = `
    VORGABEN:
    - Der KONTEXT soll zur Beantwortung der Frage dienen. 
    - Falls du die Antwort im Kontext nicht findest, sag du hast keine Antwort auf diese Frage.
    - Erwähne nicht, dass die Antwort aus dem Kontext stammt sondern gib nur die Antwort zurück.
    - Die Antwort soll in Markdown formatiert werden.

    KONTEXT:

    ${context}

    FRAGE:

    ${question}
    `
  return messageTemplate
}

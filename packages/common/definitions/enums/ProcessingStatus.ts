export const ProcessingStates = {
  Open: 'open',
  Done: 'done',
  Archived: 'archived',
} as const

export type ProcessingStatus = (typeof ProcessingStates)[keyof typeof ProcessingStates]

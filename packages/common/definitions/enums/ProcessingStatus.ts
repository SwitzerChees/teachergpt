export const ProcessingStates = {
  Open: 'open',
  Done: 'done',
  Error: 'error',
  Archived: 'archived',
} as const

export type ProcessingStatus = (typeof ProcessingStates)[keyof typeof ProcessingStates]

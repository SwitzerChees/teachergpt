export const MyTypes = {
  Text: 'text',
  Number: 'number',
} as const

export type MyType = (typeof MyTypes)[keyof typeof MyTypes]

export const ServerRoles = {
  All: 'all',
  Worker: 'worker',
  API: 'api',
} as const

export type ServerRole = (typeof ServerRoles)[keyof typeof ServerRoles]

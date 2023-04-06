import { defineStore } from 'pinia'

import { Notification } from '@mylearning/common/definitions'

export const useNotificationsStore = defineStore('notifications', () => {
  const { defaultLife = 3000, defaultShowAgainSeconds = 10 } = {}

  const notifications = ref<Notification[]>([])

  setInterval(() => {
    const notificationsToShow = notifications.value.filter((notification) => {
      if (!notification.showAgain) return false
      const showAgainTime = notification.shownAt || new Date()
      const showAgainTimeLater = new Date(showAgainTime.getTime() + defaultShowAgainSeconds * 1000)
      return new Date() > showAgainTimeLater
    })
    notificationsToShow.forEach((notification) => {
      notification.shownAt = undefined
    })
  }, 1000)

  const addNotification = (notification: Notification) => {
    notification.life = notification.life || defaultLife
    notifications.value.push(notification)
  }

  return { notifications, addNotification }
})

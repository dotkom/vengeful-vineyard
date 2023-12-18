import { createContext } from "react"

export interface NotificationType {
  show: boolean
  type: "success" | "error"
  title: string
  text: string
}

export const NotificationContext = createContext<{
  notification: NotificationType
  setNotification: (notification: NotificationType) => void
}>({
  notification: {
    show: false,
    type: "success",
    title: "",
    text: "",
  },
  setNotification: () => {},
})

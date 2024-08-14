import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react"

export interface NotificationType {
  show: boolean
  type: "success" | "error"
  title: string
  text: string
  timeout: number
}

interface NotificationContextProps {
  notification: NotificationType
  setNotification: Dispatch<SetStateAction<Partial<NotificationType>>>
}

export const NotificationContext = createContext<NotificationContextProps | undefined>(undefined)

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within a NotificationContextProvider")
  }

  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const baseSuccessNotification: NotificationType = {
    show: true,
    type: "success",
    title: "Suksess",
    text: "Handlingen ble utført",
    timeout: 1000 * 30,
  }

  const baseErrorNotification: NotificationType = {
    show: true,
    type: "error",
    title: "Noe gikk galt",
    text: "Handlingen kunne ikke utføres",
    timeout: 1000 * 30,
  }

  const [notification, setNotification] = useState<NotificationType>({
    ...baseSuccessNotification,
    show: false,
  })

  let currentTimeout: number | undefined

  const customSetNotification: Dispatch<SetStateAction<Partial<NotificationType>>> = (newNotification) => {
    if (typeof newNotification === "function") {
      newNotification = newNotification(notification)
    }

    if (currentTimeout) clearTimeout(currentTimeout)

    if (!newNotification.type) newNotification.type = "success"

    const base = newNotification.type === "success" ? baseSuccessNotification : baseErrorNotification

    setNotification({
      ...base,
      ...newNotification,
    })

    currentTimeout = window.setTimeout(() => {
      setNotification((prevState) => ({
        ...prevState,
        show: false,
      }))
    }, newNotification.timeout ?? notification.timeout)
  }

  return (
    <NotificationContext.Provider value={{ notification, setNotification: customSetNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

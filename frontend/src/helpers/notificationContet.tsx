import { createContext } from "react";

interface NotificationType {
  show: boolean;
  title: string;
  text: string;
}

export const NotificationContext = createContext<{
  notification: NotificationType;
  setNotification: (notification: NotificationType) => void;
}>({
  notification: {
    show: false,
    title: "",
    text: "",
  },
  setNotification: () => {},
});

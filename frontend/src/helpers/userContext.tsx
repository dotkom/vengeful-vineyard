import { createContext } from "react"

interface UserType {
  user_id: string
}

export const UserContext = createContext<{
  user: UserType
  setUserContext: (user: UserType) => void
}>({
  user: {
    user_id: "",
  },
  setUserContext: () => {},
})

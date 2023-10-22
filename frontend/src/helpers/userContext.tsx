import { createContext } from "react"

interface UserType {
  user_id: number
}

export const UserContext = createContext<{
  user: UserType
  setUser: (user: UserType) => void
}>({
  user: {
    user_id: 0,
  },
  setUser: () => {},
})

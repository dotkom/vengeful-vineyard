import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react"

interface UserType {
  user_id: string
}

interface CurrentUserContextProps {
  currentUser: UserType
  setCurrentUser: Dispatch<SetStateAction<UserType>>
}

export const CurrentUserContext = createContext<CurrentUserContextProps | undefined>(undefined)

export function useCurrentUser() {
  const context = useContext(CurrentUserContext)
  if (!context) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider")
  }

  return context
}

interface CurrentUserProviderProps {
  children: ReactNode
}

export function CurrentUserProvider({ children }: CurrentUserProviderProps) {
  const [currentUser, setCurrentUser] = useState<UserType>({ user_id: "" })

  return <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>{children}</CurrentUserContext.Provider>
}

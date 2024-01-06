import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react"

interface AuthContextProps {
  currentUser: string
  setCurrentUser?: Dispatch<SetStateAction<string>>
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider")
  }

  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<string>("")

  return <AuthContext.Provider value={{ currentUser, setCurrentUser }}>{children}</AuthContext.Provider>
}

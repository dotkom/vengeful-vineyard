import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react"
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query"

import { MeUser } from "../types"

type MyGroupsRefetchType = <TPageData>(
  options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
) => Promise<QueryObserverResult<MeUser, MeUser>>

interface MyGroupsRefetchContextProps {
  myGroupsRefetch: MyGroupsRefetchType | undefined
  setMyGroupsRefetch: Dispatch<SetStateAction<MyGroupsRefetchType | undefined>>
}

export const MyGroupsRefetchContext = createContext<MyGroupsRefetchContextProps | undefined>(undefined)

export function useMyGroupsRefetch() {
  const context = useContext(MyGroupsRefetchContext)
  if (!context) {
    throw new Error("useMyGroupsRefetch must be used within a MyGroupsRefetchProvider")
  }

  return context
}

interface MyGroupsRefetchProviderProps {
  children: ReactNode
}

export function MyGroupsRefetchProvider({ children }: MyGroupsRefetchProviderProps) {
  const [myGroupsRefetch, setMyGroupsRefetch] = useState<MyGroupsRefetchType | undefined>(undefined)

  return (
    <MyGroupsRefetchContext.Provider value={{ myGroupsRefetch, setMyGroupsRefetch }}>
      {children}
    </MyGroupsRefetchContext.Provider>
  )
}

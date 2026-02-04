import { useState, useMemo } from "react"
import { GroupUser } from "../../../helpers/types"

export function useFilteredMembers(members: GroupUser[], excludeIds: string[] = []) {
  const [search, setSearch] = useState("")

  const availableMembers = useMemo(
    () => members.filter((m) => !excludeIds.includes(m.user_id)),
    [members, excludeIds]
  )

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return availableMembers
    const query = search.toLowerCase()
    return availableMembers.filter((m) => {
      const fullName = `${m.first_name} ${m.last_name}`.toLowerCase()
      return fullName.includes(query)
    })
  }, [availableMembers, search])

  return { availableMembers, filteredMembers, search, setSearch }
}

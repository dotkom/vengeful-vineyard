import { useMemo } from "react"
import { Group } from "../../../helpers/types"
import { PunishmentTypeInfo } from "../../../helpers/context/playModeContext"

export function usePunishmentTypes(groupData?: Group) {
  const punishmentTypes: PunishmentTypeInfo[] = useMemo(() => {
    if (!groupData?.punishment_types) return []
    return Object.values(groupData.punishment_types).map((pt) => ({
      punishment_type_id: pt.punishment_type_id,
      name: pt.name,
      emoji: pt.emoji,
      value: pt.value,
    }))
  }, [groupData])

  const defaultType = punishmentTypes[0] || null

  return { punishmentTypes, defaultType }
}

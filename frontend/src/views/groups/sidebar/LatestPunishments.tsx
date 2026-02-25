import { FC, useMemo, useState } from "react"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import { Group, Punishment } from "../../../helpers/types"

dayjs.extend(utc)
dayjs.extend(timezone)

interface PunishmentWithUser extends Punishment {
  user_first_name: string
  user_last_name: string
}

interface LatestPunishmentsProps {
  groupData: Group | undefined
}

const INITIAL_COUNT = 5
const EXPANDED_COUNT = 20

export const LatestPunishments: FC<LatestPunishmentsProps> = ({ groupData }) => {
  const [expanded, setExpanded] = useState(false)

  const allPunishments = useMemo(() => {
    if (!groupData) return []

    return groupData.members
      .filter((m) => m.active)
      .flatMap((member) =>
        member.punishments.map((p) => ({
          ...p,
          user_first_name: member.first_name,
          user_last_name: member.last_name,
        })),
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, EXPANDED_COUNT)
  }, [groupData])

  if (!groupData || allPunishments.length === 0) return null

  const visiblePunishments = expanded ? allPunishments : allPunishments.slice(0, INITIAL_COUNT)
  const hasMore = allPunishments.length > INITIAL_COUNT

  return (
    <div className="max-w-[90%] md:max-w-none h-fit bg-white ring-1 ring-gray-900/5 rounded-xl px-4 py-5">
      <span className="ml-1 text-sm text-gray-600">Siste straffer gitt</span>
      <ul className="mt-2 flex flex-col">
        {visiblePunishments.map((p, i) => (
          <LatestPunishmentRow
            key={p.punishment_id}
            punishment={p}
            punishmentTypes={groupData.punishment_types}
            isLast={i === visiblePunishments.length - 1 && !hasMore}
          />
        ))}
      </ul>
      {hasMore && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1 w-full rounded-lg py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {expanded ? "Vis mindre" : `Vis mer (${allPunishments.length - INITIAL_COUNT} til)`}
        </button>
      )}
    </div>
  )
}

const LatestPunishmentRow: FC<{
  punishment: PunishmentWithUser
  punishmentTypes: Group["punishment_types"]
  isLast: boolean
}> = ({ punishment, punishmentTypes, isLast }) => {
  const type = punishmentTypes[punishment.punishment_type_id]
  const date = dayjs.utc(punishment.created_at).tz("Europe/Oslo")
  const displayName = `${punishment.user_first_name} ${punishment.user_last_name.charAt(0)}.`

  return (
    <li
      className={`flex items-center gap-x-2.5 px-2 py-2 text-sm ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
    >
      <span className="text-base shrink-0" title={type?.name}>
        {type?.emoji}
      </span>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-x-2">
          <span className="text-gray-700 font-medium truncate">{displayName}</span>
          <span className="text-xs text-gray-400 shrink-0">{date.format("DD. MMM")}</span>
        </div>
        {punishment.reason && !punishment.reason_hidden && (
          <span className="text-xs text-gray-400 truncate">{punishment.reason}</span>
        )}
      </div>
      {punishment.amount > 1 && (
        <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-1.5 py-0.5 shrink-0">
          {punishment.amount}x
        </span>
      )}
    </li>
  )
}

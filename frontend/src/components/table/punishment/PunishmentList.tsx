import { GroupUser, LeaderboardUser, Punishment, PunishmentType } from "../../../helpers/types"
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query"

import { Fragment } from "react"
import { PunishmentActionBar } from "./PunishmentActionBar"
import { PunishmentItem } from "./PunishmentItem"
import { useTogglePunishments } from "../../../helpers/context/togglePunishmentsContext"

interface PunishmentListProps {
  groupUser?: GroupUser | undefined
  leaderboardUser?: LeaderboardUser | undefined
  unpaidPunishments: Punishment[]
  paidPunishments: Punishment[]
  punishmentTypes: PunishmentType[]
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>
}

export const PunishmentList = ({
  groupUser = undefined,
  leaderboardUser = undefined,
  unpaidPunishments,
  paidPunishments,
  punishmentTypes,
  dataRefetch,
}: PunishmentListProps) => {
  const user = groupUser ?? leaderboardUser
  if (user === undefined) {
    return <p>user is undefined</p>
  }

  const isGroupContext = groupUser !== undefined

  let isToggled = false
  let punishments: Punishment[]

  if (isGroupContext) {
    const { isToggled: newIsToggled } = useTogglePunishments()
    isToggled = newIsToggled
    punishments = !isToggled ? unpaidPunishments : [...unpaidPunishments, ...paidPunishments]
  } else {
    punishments = [...unpaidPunishments, ...paidPunishments]
  }

  if (punishments.length === 0) {
    return (
      <Fragment>
        <PunishmentActionBar label="Ingen straffer" isGroupContext={isGroupContext} user={user} />
      </Fragment>
    )
  }

  return (
    <Fragment>
      <PunishmentActionBar isGroupContext={isGroupContext} user={user} />

      <ul className="border-t flex flex-col gap-y-px bg-gray-100 dark:border-gray-700">
        {punishments.map((punishment) => (
          <PunishmentItem
            user={user}
            punishment={punishment}
            punishmentTypes={punishmentTypes}
            isGroupContext={isGroupContext}
            key={punishment.punishment_id}
            dataRefetch={dataRefetch}
          />
        ))}
      </ul>
    </Fragment>
  )
}

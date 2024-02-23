import { GroupUser, Punishment, PunishmentType } from "../../helpers/types"
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query"

import { Fragment } from "react"
import { PunishmentActionBar } from "./PunishmentActionBar"
import { PunishmentItem } from "./PunishmentItem"

interface PunishmentListProps {
  groupUser?: GroupUser
  userId: string
  groupId?: string
  punishments: Punishment[]
  punishmentTypes?: Record<string, PunishmentType>
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>
  isGroupContext: boolean
}

export const PunishmentList = ({
  groupUser,
  userId,
  groupId,
  punishments,
  punishmentTypes,
  dataRefetch,
}: PunishmentListProps) => {
  if (punishments.length === 0) {
    return <Fragment>{groupUser && <PunishmentActionBar label="Ingen straffer" user={groupUser} />}</Fragment>
  }

  punishments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <Fragment>
      {groupUser && <PunishmentActionBar user={groupUser} />}

      <ul className="border-t flex flex-col gap-y-px bg-gray-100 dark:border-gray-700">
        {punishments.map((punishment) => (
          <PunishmentItem
            user_id={userId}
            group_id={groupId}
            punishment={punishment}
            punishmentTypes={punishmentTypes}
            isGroupContext={!!groupUser}
            key={punishment.punishment_id}
            dataRefetch={dataRefetch}
          />
        ))}
      </ul>
    </Fragment>
  )
}

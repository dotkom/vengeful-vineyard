import { useInfiniteQuery } from "@tanstack/react-query"
import { punishmentsQuery } from "../helpers/api"
import { Button } from "../components/button"
import { PunishmentItem } from "../components/punishment/PunishmentItem"
import { SkeletonPunishmentItem } from "../components/punishment/SkeletonPunishmentItem"

export default function PunishmentsLogPage() {
  const { isFetching, data, refetch, fetchNextPage } = useInfiniteQuery(punishmentsQuery())

  const punishments = data?.pages.flatMap((page) => page.results) ?? []

  return (
    <section className="mt-8 md:mt-16 max-w-5xl w-[90%] mx-auto">
      <h1 className="mb-4 text-center md:text-xl font-medium text-black">Siste straffer</h1>
      {!isFetching && punishments.length === 0 && (
        <div className="flex flex-col items-center justify-center p-4">
          <p className="text-gray-800">Ingen resultat</p>
        </div>
      )}
      {punishments.length > 0 && (
        <ul className="flex flex-col gap-y-3 dark:border-gray-700">
          {punishments.map((punishment) => (
            <li key={punishment.punishment_id} className="rounded-lg overflow-hidden">
              <PunishmentItem
                user_id={punishment.user.user_id}
                user={punishment.user}
                punishment={punishment}
                isGroupContext={false}
                dataRefetch={refetch}
                groupName={punishment.group_name}
              />
            </li>
          ))}
        </ul>
      )}
      {isFetching ? (
        <SkeletonPunishmentItem />
      ) : (
        <Button variant="OUTLINE" onClick={() => fetchNextPage().then()} className="mx-auto mt-4">
          Last inn mer
        </Button>
      )}
    </section>
  )
}

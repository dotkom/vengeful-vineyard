import { useEffect, useState } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { committeesQuery, punishmentsQuery } from "../helpers/api"
import { Button } from "../components/button"
import { Listbox } from "../components/listbox/Listbox"
import { PunishmentItem } from "../components/punishment/PunishmentItem"
import { SkeletonPunishmentItem } from "../components/punishment/SkeletonPunishmentItem"

const ALL_GROUPS = "__all__"

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function PunishmentsLogPage() {
  const [selectedGroup, setSelectedGroup] = useState(ALL_GROUPS)
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [searchInput, setSearchInput] = useState("")

  const debouncedSearch = useDebouncedValue(searchInput, 300)

  const { data: groups } = useQuery(committeesQuery())
  const groupId = selectedGroup === ALL_GROUPS ? undefined : selectedGroup
  const { isFetching, data, refetch, fetchNextPage } = useInfiniteQuery(
    punishmentsQuery(groupId, dateFrom || undefined, dateTo || undefined, debouncedSearch || undefined)
  )

  const punishments = data?.pages.flatMap((page) => page.results) ?? []

  const groupOptions = [
    { value: ALL_GROUPS, label: "Alle komiteer" },
    ...(groups ?? [])
      .slice()
      .sort((a, b) => a.group_name_short.localeCompare(b.group_name_short))
      .map((g) => ({ value: g.group_id, label: g.group_name_short })),
  ]

  const hasDateFilter = dateFrom || dateTo
  const hasSearch = searchInput.length > 0

  return (
    <section className="mt-8 md:mt-16 max-w-5xl w-[90%] mx-auto">
      <h1 className="mb-4 text-center md:text-xl font-medium text-black">Siste straffer</h1>
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div className="w-44">
          <Listbox
            label="Komité"
            value={selectedGroup}
            onChange={setSelectedGroup}
            options={groupOptions}
          />
        </div>
        <button
          onClick={() => setShowDateFilter(!showDateFilter)}
          className={`py-1.5 px-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:text-slate-400 transition-colors ${
            showDateFilter || hasDateFilter ? "bg-slate-100 dark:bg-slate-800" : ""
          }`}
        >
          {hasDateFilter ? "Datofilter aktiv" : "Filtrer på dato"}
        </button>
        {hasDateFilter && (
          <button
            onClick={() => { setDateFrom(""); setDateTo(""); setShowDateFilter(false) }}
            className="py-1.5 px-3 text-sm text-gray-500 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300"
          >
            Nullstill
          </button>
        )}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={`py-1.5 px-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:text-slate-400 transition-colors ${
            showSearch || hasSearch ? "bg-slate-100 dark:bg-slate-800" : ""
          }`}
        >
          {hasSearch ? "Søk aktivt" : "Søk på person"}
        </button>
        {hasSearch && (
          <button
            onClick={() => { setSearchInput(""); setShowSearch(false) }}
            className="py-1.5 px-3 text-sm text-gray-500 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300"
          >
            Nullstill
          </button>
        )}
      </div>
      {showDateFilter && (
        <div className="flex flex-wrap gap-3 mb-4 items-end">
          <div className="flex flex-col gap-y-1">
            <span className="font-bold text-sm ml-1 text-gray-700 dark:text-slate-400">Fra</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-md bg-white dark:bg-gray-800 py-1.5 px-3 text-gray-900 dark:text-slate-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <span className="font-bold text-sm ml-1 text-gray-700 dark:text-slate-400">Til</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-md bg-white dark:bg-gray-800 py-1.5 px-3 text-gray-900 dark:text-slate-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      )}
      {showSearch && (
        <div className="mb-4">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Skriv inn navn..."
            autoFocus
            className="w-full max-w-xs rounded-md bg-white dark:bg-gray-800 py-1.5 px-3 text-gray-900 dark:text-slate-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
        </div>
      )}
      {!isFetching && punishments.length === 0 && (
        <div className="flex flex-col items-center justify-center p-4">
          <p className="text-gray-800">Ingen resultat</p>
        </div>
      )}
      {punishments.length > 0 && (
        <ul className="flex flex-col gap-y-3 dark:border-gray-700">
          {punishments.map((punishment) => (
            <li key={punishment.punishment_id} className="rounded-lg">
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

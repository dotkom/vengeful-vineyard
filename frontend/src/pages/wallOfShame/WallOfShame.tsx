import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { Button } from "../../components/button/Button"
import { LeaderboardTable } from "../../components/leaderboardtable"
import { leaderboardQuery, userQuery } from "../../helpers/api"
import { useCurrentUser } from "../../helpers/context/currentUserContext"

type Filter = { type: "year"; year: number } | { type: "alltime" }

const currentYear = new Date().getFullYear()
const START_YEAR = 2019

export const WallOfShame = () => {
  const { setCurrentUser } = useCurrentUser()
  const [filter, setFilter] = useState<Filter>({ type: "year", year: currentYear })
  const [activeOnly, setActiveOnly] = useState(false)

  useQuery({
    ...userQuery(),
    onSuccess: ({ user_id }) => {
      if (!user_id) return

      setCurrentUser({ user_id })
    },
  })

  const isYearFilter = filter.type === "year"
  const selectedYear = isYearFilter ? filter.year : undefined
  const isCurrentYear = isYearFilter && filter.year === currentYear

  const effectiveActiveOnly = isYearFilter ? false : activeOnly

  const { isFetching, data, refetch, fetchNextPage } = useInfiniteQuery(
    leaderboardQuery(isYearFilter, isCurrentYear ? undefined : selectedYear, effectiveActiveOnly)
  )

  useEffect(() => {
    setActiveOnly(false)
  }, [filter])

  useEffect(() => {
    refetch()
  }, [filter, activeOnly, refetch])

  const leaderboardUsers = data?.pages.flatMap((page) => page.results)

  const filteredLeaderboardUsers = leaderboardUsers?.map((user) => {
    if (isYearFilter) {
      return {
        ...user,
        total_value: user.total_value_this_year,
        emojis: user.emojis_this_year,
        amount_punishments: user.amount_punishments_this_year,
        amount_unique_punishments: user.amount_unique_punishments_this_year,
      }
    }
    return user
  })

  return (
    <section className="mt-8 md:mt-16 max-w-5xl w-[90%] mx-auto">
      <div className="relative flex justify-center items-center mb-12 md:mb-4">
        <div>
          <FilterTabs filter={filter} setFilter={setFilter} className="hidden md:flex mt-1.5" />
          <h1 className="text-center md:text-3xl font-medium text-black">Wall of Shame</h1>
          <FilterTabs filter={filter} setFilter={setFilter} className="md:hidden mt-2" />
        </div>
        {!isYearFilter && (
          <>
            <MembershipTabs activeOnly={activeOnly} setActiveOnly={setActiveOnly} className="hidden md:flex" />
            <MembershipTabs activeOnly={activeOnly} setActiveOnly={setActiveOnly} className="md:hidden mt-2" />
          </>
        )}
      </div>

      <LeaderboardTable leaderboardUsers={filteredLeaderboardUsers} isFetching={isFetching} dataRefetch={refetch} />

      <Button variant="OUTLINE" onClick={() => fetchNextPage().then()} className="mx-auto mt-4">
        Last inn mer
      </Button>
    </section>
  )
}

interface FilterTabsProps {
  filter: Filter
  setFilter: React.Dispatch<React.SetStateAction<Filter>>
  className?: string
}

const FilterTabs = ({ filter, setFilter, className }: FilterTabsProps) => {
  const [yearPickerOpen, setYearPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setYearPickerOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const isYearFilter = filter.type === "year"
  const displayYear = isYearFilter ? filter.year : currentYear

  const years = Array.from({ length: currentYear - START_YEAR + 1 }, (_, i) => currentYear - i)

  return (
    <div className={`absolute left-0 flex space-x-2 text-sm ${className}`}>
      <div className="relative" ref={pickerRef}>
        <div className="flex">
          <button
            onClick={() => setFilter({ type: "year", year: displayYear })}
            className={`w-[4.5rem] border border-r-0 border-gray-200 dark:border-gray-600 py-1 rounded-l-lg bg-white dark:text-slate-400 ${
              isYearFilter ? "bg-slate-100 dark:bg-slate-800" : ""
            }`}
          >
            {displayYear}
          </button>
          <button
            onClick={() => setYearPickerOpen(!yearPickerOpen)}
            className={`w-6 flex items-center justify-center border border-gray-200 dark:border-gray-600 py-1 rounded-r-lg bg-white dark:text-slate-400 ${
              isYearFilter ? "bg-slate-100 dark:bg-slate-800" : ""
            }`}
          >
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {yearPickerOpen && (
          <div className="absolute z-20 top-full mt-1 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => {
                  setFilter({ type: "year", year: y })
                  setYearPickerOpen(false)
                }}
                className={`block w-full text-left px-4 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-300 ${
                  isYearFilter && filter.year === y ? "bg-slate-100 dark:bg-slate-700 font-medium" : ""
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => setFilter({ type: "alltime" })}
        className={`w-24 border border-gray-200 dark:border-gray-600 py-1 rounded-lg bg-white dark:text-slate-400 ${
          filter.type === "alltime" ? "bg-slate-100 dark:bg-slate-800" : ""
        }`}
      >
        All time
      </button>
    </div>
  )
}

interface MembershipTabsProps {
  activeOnly: boolean
  setActiveOnly: React.Dispatch<React.SetStateAction<boolean>>
  className?: string
}

const MembershipTabs = ({ activeOnly, setActiveOnly, className }: MembershipTabsProps) => {
  return (
    <div className={`absolute right-0 flex space-x-2 text-sm ${className}`}>
      <button
        onClick={() => setActiveOnly(true)}
        className={`w-24 border border-gray-200 dark:border-gray-600 py-1 rounded-lg bg-white dark:text-slate-400 ${
          activeOnly ? "bg-slate-100 dark:bg-slate-800" : ""
        }`}
      >
        Aktive
      </button>
      <button
        onClick={() => setActiveOnly(false)}
        className={`w-24 border border-gray-200 dark:border-gray-600 py-1 rounded-lg bg-white dark:text-slate-400 ${
          !activeOnly ? "bg-slate-100 dark:bg-slate-800" : ""
        }`}
      >
        Alle
      </button>
    </div>
  )
}

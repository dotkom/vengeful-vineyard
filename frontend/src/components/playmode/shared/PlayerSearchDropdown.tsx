import { useState } from "react"
import { MagnifyingGlassIcon, PlusIcon, UserPlusIcon } from "@heroicons/react/24/outline"
import { GroupUser } from "../../../helpers/types"

interface PlayerSearchDropdownProps {
  members: GroupUser[]
  onSelect: (member: GroupUser) => void
  disabled?: boolean
  placeholder?: string
  buttonIcon?: "plus" | "userPlus"
  fullscreen?: boolean
}

export const PlayerSearchDropdown = ({
  members,
  onSelect,
  disabled = false,
  placeholder = "Legg til spiller",
  buttonIcon = "plus",
  fullscreen = false,
}: PlayerSearchDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredMembers = members.filter((m) => {
    const fullName = `${m.first_name} ${m.last_name}`.toLowerCase()
    return fullName.includes(search.toLowerCase())
  })

  const handleSelect = (member: GroupUser) => {
    onSelect(member)
    setIsOpen(false)
    setSearch("")
  }

  const Icon = buttonIcon === "userPlus" ? UserPlusIcon : PlusIcon

  if (members.length === 0) return null

  return (
    <div className="w-full relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) setSearch("")
        }}
        disabled={disabled}
        className={`flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm disabled:opacity-50 ${
          fullscreen
            ? "border-white/30 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/50"
            : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
        }`}
      >
        <Icon className="h-4 w-4" />
        {placeholder}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg z-20">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-2 py-1">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Søk..."
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-32 overflow-y-auto">
            {filteredMembers.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Ingen treff</p>
            ) : (
              filteredMembers.map((member) => (
                <button
                  key={member.user_id}
                  onClick={() => handleSelect(member)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-gray-100 hover:bg-indigo-50 dark:hover:bg-gray-700"
                >
                  {member.first_name} {member.last_name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

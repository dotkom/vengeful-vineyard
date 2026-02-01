import { useState, useMemo, useEffect } from "react"
import { Wheel } from "react-custom-roulette"
import { usePlayMode, PunishmentTypeInfo } from "../../helpers/context/playModeContext"
import { Button } from "../button"
import { Group, GroupUser } from "../../helpers/types"
import { MinusIcon, PlusIcon, XMarkIcon, MagnifyingGlassIcon, UserPlusIcon } from "@heroicons/react/24/outline"

interface PersonWheelProps {
  members?: GroupUser[]
  groupData?: Group
  onApplyPunishment?: (player: GroupUser, punishmentType: PunishmentTypeInfo, amount: number) => void
}

interface PersonSegment {
  option: string
  style: { backgroundColor: string; textColor: string }
  member: GroupUser
}

// Colors for wheel segments
const SEGMENT_COLORS = [
  "#4f46e5", "#7c3aed", "#6366f1", "#8b5cf6",
  "#2563eb", "#3b82f6", "#0891b2", "#06b6d4",
  "#059669", "#10b981", "#d97706", "#f59e0b",
  "#dc2626", "#ef4444", "#db2777", "#ec4899",
]

export const PersonWheel = ({
  members = [],
  groupData,
  onApplyPunishment,
}: PersonWheelProps) => {
  const { isSpinning, setIsSpinning } = usePlayMode()
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const [selectedMember, setSelectedMember] = useState<GroupUser | null>(null)
  const [applied, setApplied] = useState(false)

  // Setup state - choose players and punishment BEFORE spinning
  const [wheelMembers, setWheelMembers] = useState<GroupUser[]>([])
  const [selectedPunishmentType, setSelectedPunishmentType] = useState<PunishmentTypeInfo | null>(null)
  const [punishmentAmount, setPunishmentAmount] = useState(1)
  const [showPlayerSelect, setShowPlayerSelect] = useState(false)
  const [playerSearch, setPlayerSearch] = useState("")

  // Get punishment types from group data
  const punishmentTypes: PunishmentTypeInfo[] = groupData?.punishment_types
    ? Object.values(groupData.punishment_types).map((pt) => ({
        punishment_type_id: pt.punishment_type_id,
        name: pt.name,
        emoji: pt.emoji,
        value: pt.value,
      }))
    : []

  // Set default punishment type when available
  useEffect(() => {
    if (punishmentTypes.length > 0 && !selectedPunishmentType) {
      setSelectedPunishmentType(punishmentTypes[0])
    }
  }, [punishmentTypes, selectedPunishmentType])

  // Filter out members already in wheel
  const availableMembers = members.filter(
    (member) => !wheelMembers.some((p) => p.user_id === member.user_id)
  )

  const filteredMembers = availableMembers.filter((member) => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase()
    return fullName.includes(playerSearch.toLowerCase())
  })

  // Generate segments from selected wheel members
  const segments: PersonSegment[] = useMemo(() => {
    if (wheelMembers.length === 0) return []

    return wheelMembers.map((member, index) => ({
      option: `${member.first_name}`,
      style: {
        backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
        textColor: "white"
      },
      member,
    }))
  }, [wheelMembers])

  const addPlayer = (player: GroupUser) => {
    setWheelMembers([...wheelMembers, player])
    setShowPlayerSelect(false)
    setPlayerSearch("")
  }

  const removePlayer = (userId: string) => {
    setWheelMembers(wheelMembers.filter((p) => p.user_id !== userId))
  }

  const canSpin = wheelMembers.length >= 2 && selectedPunishmentType !== null

  const handleSpinClick = () => {
    if (isSpinning || !canSpin) return

    const newPrizeNumber = Math.floor(Math.random() * segments.length)
    setPrizeNumber(newPrizeNumber)
    setMustSpin(true)
    setIsSpinning(true)
    setSelectedMember(null)
    setApplied(false)
  }

  const handleSpinComplete = () => {
    setMustSpin(false)
    setIsSpinning(false)

    const segment = segments[prizeNumber]
    setSelectedMember(segment.member)
  }

  const handleApplyPunishment = () => {
    if (!selectedMember || !selectedPunishmentType || applied) return

    onApplyPunishment?.(selectedMember, selectedPunishmentType, punishmentAmount)
    setApplied(true)
  }

  const handleReset = () => {
    setSelectedMember(null)
    setApplied(false)
  }

  const handleClearAll = () => {
    setWheelMembers([])
    setSelectedMember(null)
    setApplied(false)
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
        Ingen medlemmer i gruppen
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-y-3">
      {/* Wheel - show placeholder or actual wheel */}
      <div className="relative" style={{ transform: "scale(0.65)", transformOrigin: "top center", marginBottom: "-150px" }}>
        {segments.length >= 2 ? (
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={segments}
            onStopSpinning={handleSpinComplete}
            backgroundColors={SEGMENT_COLORS}
            textColors={["white"]}
            outerBorderColor="#374151"
            outerBorderWidth={4}
            innerRadius={15}
            innerBorderColor="#1f2937"
            innerBorderWidth={8}
            radiusLineColor="#374151"
            radiusLineWidth={1}
            fontSize={12}
            spinDuration={0.6}
          />
        ) : (
          <div className="w-[300px] h-[300px] rounded-full border-4 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center mb-12 mt-4">
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center px-8">
              Legg til minst 2 personer for å spinne
            </p>
          </div>
        )}
      </div>

      {/* Result Display */}
      {selectedMember && (
        <div className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-3">
          <div className="text-center mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Vinneren er</p>
            <p className="text-lg font-bold text-red-500">
              {selectedMember.first_name} {selectedMember.last_name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {punishmentAmount} {selectedPunishmentType?.name} {selectedPunishmentType?.emoji}
            </p>
          </div>

          {!applied ? (
            <div className="flex gap-2">
              <Button variant="OUTLINE" onClick={handleReset} className="flex-1">
                Avbryt
              </Button>
              <Button color="RED" onClick={handleApplyPunishment} className="flex-1">
                Gi straff
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-center text-sm text-green-600 dark:text-green-400">
                Straff lagt til!
              </p>
              <Button variant="OUTLINE" onClick={handleReset} className="w-full">
                Spin igjen
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Setup Section - only show when not showing result */}
      {!selectedMember && (
        <>
          {/* Punishment Selection */}
          <div className="w-full">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Straff</p>
            <div className="flex gap-1.5 flex-wrap">
              {punishmentTypes.map((pt) => (
                <button
                  key={pt.punishment_type_id}
                  onClick={() => setSelectedPunishmentType(pt)}
                  disabled={isSpinning}
                  className={`rounded-lg border px-2 py-1 text-xs font-medium transition-all ${
                    selectedPunishmentType?.punishment_type_id === pt.punishment_type_id
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                      : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  {pt.emoji} {pt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Selection */}
          <div className="w-full">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Antall</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPunishmentAmount(Math.max(1, punishmentAmount - 1))}
                disabled={isSpinning}
                className="rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100 w-6 text-center">
                {punishmentAmount}
              </span>
              <button
                onClick={() => setPunishmentAmount(punishmentAmount + 1)}
                disabled={isSpinning}
                className="rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Selected Players */}
          {wheelMembers.length > 0 && (
            <div className="w-full space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Personer i hjulet ({wheelMembers.length})
                </p>
                {wheelMembers.length > 1 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-red-500 hover:text-red-600"
                    disabled={isSpinning}
                  >
                    Fjern alle
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {wheelMembers.map((player, index) => (
                  <div
                    key={player.user_id}
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }}
                  >
                    <span>{player.first_name}</span>
                    <button
                      onClick={() => removePlayer(player.user_id)}
                      className="rounded-full hover:bg-white/20"
                      disabled={isSpinning}
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Player Button / Dropdown */}
          {availableMembers.length > 0 && (
            <div className="w-full relative">
              <button
                onClick={() => {
                  setShowPlayerSelect(!showPlayerSelect)
                  if (!showPlayerSelect) setPlayerSearch("")
                }}
                disabled={isSpinning}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50"
              >
                <UserPlusIcon className="h-4 w-4" />
                Legg til person
              </button>

              {showPlayerSelect && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg z-20">
                  <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-2 py-1">
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={playerSearch}
                        onChange={(e) => setPlayerSearch(e.target.value)}
                        placeholder="Søk..."
                        className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 outline-none placeholder:text-gray-400"
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
                          onClick={() => addPlayer(member)}
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
          )}
        </>
      )}

      {/* Spin Button */}
      {!selectedMember && (
        <Button
          onClick={handleSpinClick}
          disabled={isSpinning || !canSpin}
          className="w-full"
        >
          {isSpinning ? "Spinner..." : !canSpin ? "Legg til minst 2 personer" : "Spin!"}
        </Button>
      )}
    </div>
  )
}

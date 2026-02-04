import { useState } from "react"
import { Wheel } from "react-custom-roulette"
import { usePlayMode, PunishmentTypeInfo } from "../../helpers/context/playModeContext"
import { Button } from "../button"
import { PencilIcon, UserIcon, PlusIcon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { Group, GroupUser } from "../../helpers/types"

export interface WheelSegment {
  option: string
  style: { backgroundColor: string; textColor: string }
  punishmentAmount: number
  punishmentTypeId?: string // Optional - if set, uses this specific type
  punishmentTypeName?: string // Optional - matches by name (used for defaults that work across groups)
}

interface SpinResult {
  player: GroupUser
  segment: WheelSegment
  punishmentType: PunishmentTypeInfo | null
  applied: boolean
}

// Default segments using ølstraff, vinstraff, and ingen - works for all committees
const DEFAULT_SEGMENTS: WheelSegment[] = [
  { option: "1 Ølstraff", style: { backgroundColor: "#f59e0b", textColor: "white" }, punishmentAmount: 1, punishmentTypeName: "Ølstraff" },
  { option: "Ingen!", style: { backgroundColor: "#22c55e", textColor: "white" }, punishmentAmount: 0 },
  { option: "1 Vinstraff", style: { backgroundColor: "#7c3aed", textColor: "white" }, punishmentAmount: 1, punishmentTypeName: "Vinstraff" },
  { option: "2 Ølstraff", style: { backgroundColor: "#d97706", textColor: "white" }, punishmentAmount: 2, punishmentTypeName: "Ølstraff" },
  { option: "Ingen!", style: { backgroundColor: "#10b981", textColor: "white" }, punishmentAmount: 0 },
  { option: "2 Vinstraff", style: { backgroundColor: "#6366f1", textColor: "white" }, punishmentAmount: 2, punishmentTypeName: "Vinstraff" },
  { option: "3 Ølstraff", style: { backgroundColor: "#b45309", textColor: "white" }, punishmentAmount: 3, punishmentTypeName: "Ølstraff" },
  { option: "Ingen!", style: { backgroundColor: "#059669", textColor: "white" }, punishmentAmount: 0 },
]

interface CustomWheelProps {
  onEditSegments: () => void
  segments?: WheelSegment[]
  members?: GroupUser[]
  groupData?: Group
  onApplyPunishment?: (player: GroupUser, punishmentType: PunishmentTypeInfo, amount: number) => void
  fullscreen?: boolean
}

export const CustomWheel = ({
  onEditSegments,
  segments = DEFAULT_SEGMENTS,
  members = [],
  groupData,
  onApplyPunishment,
  fullscreen = false,
}: CustomWheelProps) => {
  const { isSpinning, setIsSpinning, setLastResult } = usePlayMode()
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const [lastSpinResult, setLastSpinResult] = useState<SpinResult | null>(null)

  // Multiple players support
  const [playerQueue, setPlayerQueue] = useState<GroupUser[]>([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
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

  const defaultPunishmentType = punishmentTypes[0] || null

  // Filter out members already in queue
  const availableMembers = members.filter(
    (member) => !playerQueue.some((p) => p.user_id === member.user_id)
  )

  const filteredMembers = availableMembers.filter((member) => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase()
    return fullName.includes(playerSearch.toLowerCase())
  })

  const currentPlayer = playerQueue[currentPlayerIndex] || null

  const addPlayer = (player: GroupUser) => {
    setPlayerQueue([...playerQueue, player])
    setShowPlayerSelect(false)
    setPlayerSearch("")
  }

  const removePlayer = (userId: string) => {
    const newQueue = playerQueue.filter((p) => p.user_id !== userId)
    setPlayerQueue(newQueue)
    // Adjust current index if needed
    if (currentPlayerIndex >= newQueue.length) {
      setCurrentPlayerIndex(Math.max(0, newQueue.length - 1))
    }
  }

  const handleSpinClick = () => {
    if (isSpinning || !currentPlayer) return

    const newPrizeNumber = Math.floor(Math.random() * segments.length)
    setPrizeNumber(newPrizeNumber)
    setMustSpin(true)
    setIsSpinning(true)
    setLastSpinResult(null)
  }

  const handleSpinComplete = () => {
    setMustSpin(false)
    setIsSpinning(false)

    const segment = segments[prizeNumber]
    setLastResult({
      segmentIndex: prizeNumber,
      segmentLabel: segment.option,
      punishmentAmount: segment.punishmentAmount,
    })

    // Find the punishment type for this segment
    let punishmentType: PunishmentTypeInfo | null = null
    if (segment.punishmentTypeId) {
      // Match by ID first
      punishmentType = punishmentTypes.find((pt) => pt.punishment_type_id === segment.punishmentTypeId) || null
    } else if (segment.punishmentTypeName) {
      // Match by name (case-insensitive) - used for defaults that work across groups
      punishmentType = punishmentTypes.find((pt) => pt.name.toLowerCase() === segment.punishmentTypeName?.toLowerCase()) || null
    }

    // Fallback to default punishment type if segment has a punishment but no match found
    if (!punishmentType && segment.punishmentAmount > 0) {
      punishmentType = defaultPunishmentType
    }

    if (currentPlayer) {
      setLastSpinResult({
        player: currentPlayer,
        segment,
        punishmentType,
        applied: false,
      })
    }
  }

  const handleApplyPunishment = () => {
    if (!lastSpinResult || lastSpinResult.applied || lastSpinResult.segment.punishmentAmount <= 0 || !lastSpinResult.punishmentType) return

    onApplyPunishment?.(
      lastSpinResult.player,
      lastSpinResult.punishmentType,
      lastSpinResult.segment.punishmentAmount
    )

    setLastSpinResult({ ...lastSpinResult, applied: true })
  }

  const handleNext = () => {
    setLastSpinResult(null)
    // Move to next player
    if (currentPlayerIndex < playerQueue.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1)
    } else {
      // All players done - reset
      setCurrentPlayerIndex(0)
    }
  }

  const handleClearAll = () => {
    setPlayerQueue([])
    setCurrentPlayerIndex(0)
    setLastSpinResult(null)
  }

  const wheel = (
    <div
      className="relative"
      style={fullscreen
        ? { transform: "scale(1.3)", transformOrigin: "center center" }
        : { transform: "scale(0.65)", transformOrigin: "top center", marginBottom: "-150px" }
      }
    >
      <Wheel
        mustStartSpinning={mustSpin}
        prizeNumber={prizeNumber}
        data={segments}
        onStopSpinning={handleSpinComplete}
        backgroundColors={["#4f46e5", "#7c3aed"]}
        textColors={["white"]}
        outerBorderColor="#374151"
        outerBorderWidth={4}
        innerRadius={15}
        innerBorderColor="#1f2937"
        innerBorderWidth={8}
        radiusLineColor="#374151"
        radiusLineWidth={1}
        fontSize={fullscreen ? 16 : 13}
        spinDuration={0.6}
      />
    </div>
  )

  const controls = (
    <div className="flex flex-col gap-y-3 w-full">
      {/* Player Queue */}
      {playerQueue.length > 0 && !lastSpinResult && (
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Spillere ({currentPlayerIndex + 1}/{playerQueue.length})
            </p>
            {playerQueue.length > 1 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-red-500 hover:text-red-600"
                disabled={isSpinning}
              >
                Fjern alle
              </button>
            )}
          </div>
          {playerQueue.map((player, index) => (
            <div
              key={player.user_id}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                index === currentPlayerIndex
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <UserIcon className={`h-4 w-4 ${index === currentPlayerIndex ? "text-indigo-500" : "text-gray-400"}`} />
                <span className={`text-sm font-medium ${index === currentPlayerIndex ? "text-indigo-700 dark:text-indigo-300" : "text-gray-900 dark:text-gray-100"}`}>
                  {player.first_name} {player.last_name}
                </span>
                {index === currentPlayerIndex && (
                  <span className="text-xs text-indigo-500 dark:text-indigo-400">(neste)</span>
                )}
              </div>
              <button
                onClick={() => removePlayer(player.user_id)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500"
                disabled={isSpinning}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Result Display */}
      {lastSpinResult && (
        <div className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-3">
          <div className="text-center mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Resultat for</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {lastSpinResult.player.first_name} {lastSpinResult.player.last_name}
            </p>
            <p className={`text-lg font-bold ${lastSpinResult.segment.punishmentAmount > 0 ? "text-red-500" : "text-green-500"}`}>
              {lastSpinResult.segment.option}
              {lastSpinResult.punishmentType && ` ${lastSpinResult.punishmentType.emoji}`}
            </p>
          </div>

          {!lastSpinResult.applied && lastSpinResult.segment.punishmentAmount > 0 && lastSpinResult.punishmentType && (
            <div className="flex gap-2">
              <Button variant="OUTLINE" onClick={handleNext} className="flex-1">
                Hopp over
              </Button>
              <Button color="RED" onClick={handleApplyPunishment} className="flex-1">
                Gi straff
              </Button>
            </div>
          )}

          {lastSpinResult.applied && (
            <div className="space-y-2">
              <p className="text-center text-sm text-green-600 dark:text-green-400">
                Straff lagt til!
              </p>
              <Button variant="OUTLINE" onClick={handleNext} className="w-full">
                {currentPlayerIndex < playerQueue.length - 1 ? "Neste spiller" : "Ferdig"}
              </Button>
            </div>
          )}

          {(lastSpinResult.segment.punishmentAmount <= 0 || !lastSpinResult.punishmentType) && !lastSpinResult.applied && (
            <Button variant="OUTLINE" onClick={handleNext} className="w-full">
              {lastSpinResult.segment.punishmentAmount === -1
                ? "Neste (Dobbel!)"
                : currentPlayerIndex < playerQueue.length - 1
                ? "Neste spiller"
                : "Ferdig"}
            </Button>
          )}
        </div>
      )}

      {/* Add Player Button / Dropdown */}
      {!lastSpinResult && members.length > 0 && availableMembers.length > 0 && (
        <div className="w-full relative">
          <button
            onClick={() => {
              setShowPlayerSelect(!showPlayerSelect)
              if (!showPlayerSelect) setPlayerSearch("")
            }}
            disabled={isSpinning}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4" />
            Legg til spiller
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

      {/* Action Buttons */}
      <div className="flex flex-row gap-x-2 w-full">
        <Button
          onClick={handleSpinClick}
          disabled={isSpinning || playerQueue.length === 0}
          className="flex-1"
        >
          {isSpinning ? "Spinner..." : playerQueue.length === 0 ? "Legg til spillere" : "Spin!"}
        </Button>
        <button
          onClick={onEditSegments}
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
          title="Rediger hjulet"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )

  if (fullscreen) {
    return (
      <div className="h-full flex gap-8 items-center">
        {/* Left side - Big wheel */}
        <div className="flex-1 flex items-center justify-center">
          {wheel}
        </div>
        {/* Right side - Controls */}
        <div className="w-80 h-full flex flex-col gap-y-4 bg-white/10 rounded-2xl p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white">Spillere</h3>
          {controls}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-y-3">
      {wheel}
      {controls}
    </div>
  )
}

export { DEFAULT_SEGMENTS }

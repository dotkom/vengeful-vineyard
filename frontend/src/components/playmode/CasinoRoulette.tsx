import { useState } from "react"
import { Button } from "../button"
import { usePlayMode, PlayerBetEntry, PlayerResult, PunishmentTypeInfo, WinnerAssignment } from "../../helpers/context/playModeContext"
import { BettingModal, BetType, getNumberColor } from "./BettingModal"
import { ResultsModal } from "./ResultsModal"
import { Group, GroupUser } from "../../helpers/types"
import { UserIcon, MagnifyingGlassIcon, PlusIcon, XMarkIcon, EyeIcon } from "@heroicons/react/24/solid"

// European roulette numbers in wheel order
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
]

// Generate conic gradient for equal-sized segments
const generateRouletteGradient = () => {
  const segmentAngle = 360 / 37
  const stops: string[] = []

  WHEEL_NUMBERS.forEach((num, i) => {
    const color = getNumberColor(num)
    const colorHex = color === "red" ? "#dc2626" : color === "black" ? "#1f2937" : "#16a34a"
    const startAngle = i * segmentAngle
    const endAngle = (i + 1) * segmentAngle
    stops.push(`${colorHex} ${startAngle}deg ${endAngle}deg`)
  })

  return `conic-gradient(from -${segmentAngle / 2}deg, ${stops.join(", ")})`
}

const getBetLabel = (bet: BetType): string => {
  switch (bet.type) {
    case "number": return `#${bet.value}`
    case "color": return bet.value === "red" ? "Rød" : "Svart"
    case "evenOdd": return bet.value === "even" ? "Partall" : "Oddetall"
    case "highLow": return bet.value === "low" ? "1-18" : "19-36"
    case "dozen": return `Dusin ${bet.value}`
  }
}

interface CasinoRouletteProps {
  members?: GroupUser[]
  groupData?: Group
  onApplyPunishments?: (losers: PlayerResult[], winnerAssignments: WinnerAssignment[]) => void
  fullscreen?: boolean
}

export const CasinoRoulette = ({ members = [], groupData, onApplyPunishments, fullscreen = false }: CasinoRouletteProps) => {
  const { isSpinning, setIsSpinning, playerEntries, setPlayerEntries, lastCasinoSpin, setLastCasinoSpin } = usePlayMode()
  const [result, setResult] = useState<number | null>(null)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [showBettingModal, setShowBettingModal] = useState(false)
  const [showPlayerSelect, setShowPlayerSelect] = useState(false)
  const [playerSearch, setPlayerSearch] = useState("")
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [playerResults, setPlayerResults] = useState<PlayerResult[]>([])
  const [pendingPlayer, setPendingPlayer] = useState<GroupUser | null>(null)
  const [selectedPunishmentType, setSelectedPunishmentType] = useState<PunishmentTypeInfo | null>(null)
  const [selectedAmount, setSelectedAmount] = useState(1)

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

  // Filter members not already in entries
  const availableMembers = members.filter(
    (member) => !playerEntries.some((entry) => entry.player.user_id === member.user_id)
  )

  const filteredMembers = availableMembers.filter((member) => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase()
    return fullName.includes(playerSearch.toLowerCase())
  })

  const checkWin = (bet: BetType, resultNum: number): boolean => {
    if (resultNum === 0) return bet.type === "number" && bet.value === 0

    switch (bet.type) {
      case "number":
        return bet.value === resultNum
      case "color":
        return getNumberColor(resultNum) === bet.value
      case "evenOdd":
        return bet.value === "even" ? resultNum % 2 === 0 : resultNum % 2 === 1
      case "highLow":
        return bet.value === "low" ? resultNum <= 18 : resultNum >= 19
      case "dozen":
        if (bet.value === 1) return resultNum >= 1 && resultNum <= 12
        if (bet.value === 2) return resultNum >= 13 && resultNum <= 24
        return resultNum >= 25 && resultNum <= 36
    }
  }

  const startAddPlayer = (player: GroupUser) => {
    setPendingPlayer(player)
    setSelectedPunishmentType(defaultPunishmentType)
    setSelectedAmount(1)
    setShowPlayerSelect(false)
    setPlayerSearch("")
    setEditingEntryId(null)
    setShowBettingModal(true)
  }

  const editEntry = (entry: PlayerBetEntry) => {
    setEditingEntryId(entry.id)
    setPendingPlayer(null)
    setSelectedPunishmentType(entry.punishmentType)
    setSelectedAmount(entry.amount)
    setShowBettingModal(true)
  }

  const removeEntry = (entryId: string) => {
    setPlayerEntries(playerEntries.filter((e) => e.id !== entryId))
  }

  const handleBetConfirm = (bet: BetType) => {
    if (!selectedPunishmentType) return

    if (pendingPlayer) {
      // Adding new player
      const newEntry: PlayerBetEntry = {
        id: `${pendingPlayer.user_id}-${Date.now()}`,
        player: pendingPlayer,
        bet,
        punishmentType: selectedPunishmentType,
        amount: selectedAmount,
      }
      setPlayerEntries([...playerEntries, newEntry])
      setPendingPlayer(null)
    } else if (editingEntryId) {
      // Editing existing entry
      setPlayerEntries(
        playerEntries.map((e) =>
          e.id === editingEntryId
            ? { ...e, bet, punishmentType: selectedPunishmentType, amount: selectedAmount }
            : e
        )
      )
    }
    setEditingEntryId(null)
  }

  const spin = () => {
    if (isSpinning) return

    setIsSpinning(true)

    const resultIndex = Math.floor(Math.random() * 37)
    const resultNum = WHEEL_NUMBERS[resultIndex]

    // Calculate rotation
    const segmentAngle = 360 / 37
    const targetRemainder = (360 - resultIndex * segmentAngle + 360) % 360
    const currentRemainder = ((wheelRotation % 360) + 360) % 360

    let delta = targetRemainder - currentRemainder
    if (delta <= 0) delta += 360

    const extraSpins = Math.floor(5 + Math.random() * 3)
    const newRotation = wheelRotation + delta + extraSpins * 360

    setWheelRotation(newRotation)

    setTimeout(() => {
      setResult(resultNum)
      setIsSpinning(false)

      // Calculate results for all players
      const results: PlayerResult[] = playerEntries.map((entry) => ({
        entry,
        won: checkWin(entry.bet, resultNum),
        resultNumber: resultNum,
      }))
      setPlayerResults(results)

      // Store in context for reopening later
      setLastCasinoSpin({
        resultNumber: resultNum,
        playerResults: results,
        applied: false,
      })

      setShowResultsModal(true)
    }, 4000)
  }

  const handleApplyPunishments = (losers: PlayerResult[], winnerAssignments: WinnerAssignment[]) => {
    onApplyPunishments?.(losers, winnerAssignments)
    // Mark as applied
    if (lastCasinoSpin) {
      setLastCasinoSpin({ ...lastCasinoSpin, applied: true })
    }
    // Clear entries after applying
    setPlayerEntries([])
  }

  const handleCloseResults = () => {
    // Don't clear results - keep them for "Se resultater" button
  }

  const reopenResults = () => {
    if (lastCasinoSpin) {
      setResult(lastCasinoSpin.resultNumber)
      setPlayerResults(lastCasinoSpin.playerResults)
      setShowResultsModal(true)
    }
  }

  const currentEditingEntry = playerEntries.find((e) => e.id === editingEntryId)

  // Wheel size based on fullscreen mode
  const wheelSize = fullscreen ? 500 : 260
  const centerSize = fullscreen ? 80 : 56
  const pointerSize = fullscreen ? 40 : 28
  const numberFontSize = fullscreen ? "text-sm" : "text-[10px]"

  const wheel = (
    <div className="relative" style={{ height: wheelSize, width: wheelSize }}>
      {/* Outer gold ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800 p-1.5 shadow-2xl">
        {/* Inner dark ring */}
        <div className="h-full w-full rounded-full bg-gradient-to-b from-gray-800 to-gray-900 p-1.5">
          {/* Wheel with numbers */}
          <div
            className="relative h-full w-full rounded-full shadow-inner overflow-hidden"
            style={{
              transform: `rotate(${wheelRotation}deg)`,
              transition: isSpinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
              background: generateRouletteGradient(),
            }}
          >
            {/* Numbers positioned radially */}
            {WHEEL_NUMBERS.map((num, i) => {
              const segmentAngle = 360 / 37
              const angle = i * segmentAngle
              const radius = 42
              const radians = ((angle - 90) * Math.PI) / 180
              const x = 50 + radius * Math.cos(radians)
              const y = 50 + radius * Math.sin(radians)
              return (
                <div
                  key={i}
                  className="absolute flex items-center justify-center"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: "20px",
                    height: "20px",
                    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  }}
                >
                  <span
                    className={`${numberFontSize} font-bold text-white`}
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}
                  >
                    {num}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Center piece */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-amber-400 to-amber-700 shadow-lg border-2 border-amber-300"
        style={{ height: centerSize, width: centerSize }}
      >
        <div className="absolute inset-1 rounded-full bg-gradient-to-b from-amber-600 to-amber-900" />
      </div>

      {/* Pointer/marker */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10">
        <div
          className="bg-gradient-to-b from-amber-300 to-amber-500 shadow-lg"
          style={{
            width: pointerSize,
            height: pointerSize,
            clipPath: "polygon(50% 100%, 0% 30%, 50% 0%, 100% 30%)",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
          }}
        />
      </div>
    </div>
  )

  const controls = (
    <div className="flex flex-col gap-y-4 w-full">
      {/* Player Entries List */}
      {playerEntries.length > 0 && (
        <div className="w-full space-y-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Spillere</p>
          {playerEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {entry.player.first_name} {entry.player.last_name}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                  Innsats: {entry.amount} {entry.punishmentType.name} {entry.punishmentType.emoji}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => editEntry(entry)}
                  className="rounded bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                  disabled={isSpinning}
                >
                  {getBetLabel(entry.bet)}
                </button>
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500"
                  disabled={isSpinning}
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Player Button / Dropdown */}
      {members.length > 0 && availableMembers.length > 0 && (
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
              {/* Search input */}
              <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-2 py-1">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    placeholder="Søk..."
                    className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    autoFocus
                  />
                </div>
              </div>
              {/* Members list */}
              <div className="max-h-32 overflow-y-auto">
                {filteredMembers.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Ingen treff</p>
                ) : (
                  filteredMembers.map((member) => (
                    <button
                      key={member.user_id}
                      onClick={() => startAddPlayer(member)}
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
      <div className="w-full flex flex-col gap-2">
        <Button
          onClick={spin}
          disabled={isSpinning || playerEntries.length === 0}
          className="w-full"
        >
          {isSpinning ? "Spinner..." : playerEntries.length === 0 ? "Legg til spillere først" : "Spin!"}
        </Button>

        {/* Show last results button */}
        {lastCasinoSpin && !isSpinning && (
          <button
            onClick={reopenResults}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <EyeIcon className="h-4 w-4" />
            Se siste resultater
            {!lastCasinoSpin.applied && (
              <span className="rounded-full bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                Ikke behandlet
              </span>
            )}
          </button>
        )}
      </div>

      {/* Betting Modal with Punishment Type Selection */}
      <BettingModal
        open={showBettingModal}
        setOpen={(open) => {
          setShowBettingModal(open)
          if (!open) {
            setEditingEntryId(null)
            setPendingPlayer(null)
          }
        }}
        currentBet={currentEditingEntry?.bet ?? null}
        onPlaceBet={handleBetConfirm}
        playerName={pendingPlayer ? `${pendingPlayer.first_name} ${pendingPlayer.last_name}` : currentEditingEntry ? `${currentEditingEntry.player.first_name} ${currentEditingEntry.player.last_name}` : undefined}
        punishmentTypes={punishmentTypes}
        selectedPunishmentType={selectedPunishmentType}
        onPunishmentTypeChange={setSelectedPunishmentType}
        amount={selectedAmount}
        onAmountChange={setSelectedAmount}
      />

      {/* Results Modal */}
      <ResultsModal
        open={showResultsModal}
        setOpen={setShowResultsModal}
        resultNumber={result}
        playerResults={playerResults}
        onApplyPunishments={handleApplyPunishments}
        onClose={handleCloseResults}
        alreadyApplied={lastCasinoSpin?.applied}
        members={members}
      />
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
    <div className="flex flex-col items-center gap-y-4">
      {wheel}
      {controls}
    </div>
  )
}

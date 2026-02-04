import { useState } from "react"
import { Button } from "../button"
import { usePlayMode, PlayerBetEntry, PlayerResult, WinnerAssignment, PunishmentTypeInfo } from "../../helpers/context/playModeContext"
import { BettingModal, BetType } from "./BettingModal"
import { ResultsModal } from "./ResultsModal"
import { Group, GroupUser } from "../../helpers/types"
import { UserIcon, XMarkIcon, EyeIcon } from "@heroicons/react/24/solid"
import { usePunishmentTypes } from "./hooks"
import { PlayerSearchDropdown, WheelLayout } from "./shared"
import { WHEEL_NUMBERS, getNumberColor, getBetLabel, checkWin, generateRouletteGradient } from "./utils/rouletteUtils"

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
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [playerResults, setPlayerResults] = useState<PlayerResult[]>([])
  const [pendingPlayer, setPendingPlayer] = useState<GroupUser | null>(null)
  const [selectedPunishmentType, setSelectedPunishmentType] = useState<PunishmentTypeInfo | null>(null)
  const [selectedAmount, setSelectedAmount] = useState(1)

  const { punishmentTypes, defaultType } = usePunishmentTypes(groupData)

  const availableMembers = members.filter(
    (member) => !playerEntries.some((entry) => entry.player.user_id === member.user_id)
  )

  const startAddPlayer = (player: GroupUser) => {
    setPendingPlayer(player)
    setSelectedPunishmentType(defaultType)
    setSelectedAmount(1)
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
      const results: PlayerResult[] = playerEntries.map((entry) => ({
        entry,
        won: checkWin(entry.bet, resultNum),
        resultNumber: resultNum,
      }))
      setPlayerResults(results)
      setLastCasinoSpin({ resultNumber: resultNum, playerResults: results, applied: false })
      setShowResultsModal(true)
    }, 4000)
  }

  const handleApplyPunishments = (losers: PlayerResult[], winnerAssignments: WinnerAssignment[]) => {
    onApplyPunishments?.(losers, winnerAssignments)
    if (lastCasinoSpin) setLastCasinoSpin({ ...lastCasinoSpin, applied: true })
    setPlayerEntries([])
  }

  const reopenResults = () => {
    if (lastCasinoSpin) {
      setResult(lastCasinoSpin.resultNumber)
      setPlayerResults(lastCasinoSpin.playerResults)
      setShowResultsModal(true)
    }
  }

  const currentEditingEntry = playerEntries.find((e) => e.id === editingEntryId)
  const wheelSize = fullscreen ? 500 : 260
  const centerSize = fullscreen ? 80 : 56
  const pointerSize = fullscreen ? 40 : 28
  const numberFontSize = fullscreen ? "text-sm" : "text-[10px]"

  const wheel = (
    <div className="relative" style={{ height: wheelSize, width: wheelSize }}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800 p-1.5 shadow-2xl">
        <div className="h-full w-full rounded-full bg-gradient-to-b from-gray-800 to-gray-900 p-1.5">
          <div
            className="relative h-full w-full rounded-full shadow-inner overflow-hidden"
            style={{
              transform: `rotate(${wheelRotation}deg)`,
              transition: isSpinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
              background: generateRouletteGradient(),
            }}
          >
            {WHEEL_NUMBERS.map((num, i) => {
              const segmentAngle = 360 / 37
              const angle = i * segmentAngle
              const radians = ((angle - 90) * Math.PI) / 180
              const x = 50 + 42 * Math.cos(radians)
              const y = 50 + 42 * Math.sin(radians)
              return (
                <div
                  key={i}
                  className="absolute flex items-center justify-center"
                  style={{ left: `${x}%`, top: `${y}%`, width: "20px", height: "20px", transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
                >
                  <span className={`${numberFontSize} font-bold text-white`} style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}>{num}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-amber-400 to-amber-700 shadow-lg border-2 border-amber-300"
        style={{ height: centerSize, width: centerSize }}
      >
        <div className="absolute inset-1 rounded-full bg-gradient-to-b from-amber-600 to-amber-900" />
      </div>
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10">
        <div
          className="bg-gradient-to-b from-amber-300 to-amber-500 shadow-lg"
          style={{ width: pointerSize, height: pointerSize, clipPath: "polygon(50% 100%, 0% 30%, 50% 0%, 100% 30%)", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}
        />
      </div>
    </div>
  )

  const controls = (
    <div className="flex flex-col gap-y-4 w-full">
      {playerEntries.length > 0 && (
        <div className="w-full space-y-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Spillere</p>
          {playerEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{entry.player.first_name} {entry.player.last_name}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-6">Innsats: {entry.amount} {entry.punishmentType.name} {entry.punishmentType.emoji}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => editEntry(entry)} className="rounded bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50" disabled={isSpinning}>
                  {getBetLabel(entry.bet)}
                </button>
                <button onClick={() => removeEntry(entry.id)} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500" disabled={isSpinning}>
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {members.length > 0 && availableMembers.length > 0 && (
        <PlayerSearchDropdown members={availableMembers} onSelect={startAddPlayer} disabled={isSpinning} placeholder="Legg til spiller" />
      )}

      <div className="w-full flex flex-col gap-2">
        <Button onClick={spin} disabled={isSpinning || playerEntries.length === 0} className="w-full">
          {isSpinning ? "Spinner..." : playerEntries.length === 0 ? "Legg til spillere først" : "Spin!"}
        </Button>
        {lastCasinoSpin && !isSpinning && (
          <button onClick={reopenResults} className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <EyeIcon className="h-4 w-4" />
            Se siste resultater
            {!lastCasinoSpin.applied && <span className="rounded-full bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">Ikke behandlet</span>}
          </button>
        )}
      </div>

      <BettingModal
        open={showBettingModal}
        setOpen={(open) => { setShowBettingModal(open); if (!open) { setEditingEntryId(null); setPendingPlayer(null) } }}
        currentBet={currentEditingEntry?.bet ?? null}
        onPlaceBet={handleBetConfirm}
        playerName={pendingPlayer ? `${pendingPlayer.first_name} ${pendingPlayer.last_name}` : currentEditingEntry ? `${currentEditingEntry.player.first_name} ${currentEditingEntry.player.last_name}` : undefined}
        punishmentTypes={punishmentTypes}
        selectedPunishmentType={selectedPunishmentType}
        onPunishmentTypeChange={setSelectedPunishmentType}
        amount={selectedAmount}
        onAmountChange={setSelectedAmount}
      />

      <ResultsModal
        open={showResultsModal}
        setOpen={setShowResultsModal}
        resultNumber={result}
        playerResults={playerResults}
        onApplyPunishments={handleApplyPunishments}
        onClose={() => {}}
        alreadyApplied={lastCasinoSpin?.applied}
        members={members}
      />
    </div>
  )

  return <WheelLayout fullscreen={fullscreen} wheel={wheel} controls={controls} />
}

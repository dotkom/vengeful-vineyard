import { useState } from "react"
import { Wheel } from "react-custom-roulette"
import { usePlayMode, PunishmentTypeInfo } from "../../helpers/context/playModeContext"
import { Button } from "../button"
import { PencilIcon, UserIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Group, GroupUser } from "../../helpers/types"
import { usePunishmentTypes } from "./hooks"
import { PlayerSearchDropdown, WheelLayout, SpinResultCard } from "./shared"

export interface WheelSegment {
  option: string
  style: { backgroundColor: string; textColor: string }
  punishmentAmount: number
  punishmentTypeId?: string
  punishmentTypeName?: string
}

interface SpinResult {
  player: GroupUser
  segment: WheelSegment
  punishmentType: PunishmentTypeInfo | null
  applied: boolean
}

export const DEFAULT_SEGMENTS: WheelSegment[] = [
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

export const CustomWheel = ({ onEditSegments, segments = DEFAULT_SEGMENTS, members = [], groupData, onApplyPunishment, fullscreen = false }: CustomWheelProps) => {
  const { isSpinning, setIsSpinning, setLastResult } = usePlayMode()
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const [lastSpinResult, setLastSpinResult] = useState<SpinResult | null>(null)
  const [playerQueue, setPlayerQueue] = useState<GroupUser[]>([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)

  const { punishmentTypes, defaultType } = usePunishmentTypes(groupData)

  const availableMembers = members.filter((m) => !playerQueue.some((p) => p.user_id === m.user_id))
  const currentPlayer = playerQueue[currentPlayerIndex] || null

  const addPlayer = (player: GroupUser) => setPlayerQueue([...playerQueue, player])
  const removePlayer = (userId: string) => {
    const newQueue = playerQueue.filter((p) => p.user_id !== userId)
    setPlayerQueue(newQueue)
    if (currentPlayerIndex >= newQueue.length) setCurrentPlayerIndex(Math.max(0, newQueue.length - 1))
  }

  const handleSpinClick = () => {
    if (isSpinning || !currentPlayer) return
    setPrizeNumber(Math.floor(Math.random() * segments.length))
    setMustSpin(true)
    setIsSpinning(true)
    setLastSpinResult(null)
  }

  const handleSpinComplete = () => {
    setMustSpin(false)
    setIsSpinning(false)
    const segment = segments[prizeNumber]
    setLastResult({ segmentIndex: prizeNumber, segmentLabel: segment.option, punishmentAmount: segment.punishmentAmount })

    let punishmentType: PunishmentTypeInfo | null = null
    if (segment.punishmentTypeId) {
      punishmentType = punishmentTypes.find((pt) => pt.punishment_type_id === segment.punishmentTypeId) || null
    } else if (segment.punishmentTypeName) {
      punishmentType = punishmentTypes.find((pt) => pt.name.toLowerCase() === segment.punishmentTypeName?.toLowerCase()) || null
    }
    if (!punishmentType && segment.punishmentAmount > 0) punishmentType = defaultType

    if (currentPlayer) setLastSpinResult({ player: currentPlayer, segment, punishmentType, applied: false })
  }

  const handleApplyPunishment = () => {
    if (!lastSpinResult || lastSpinResult.applied || lastSpinResult.segment.punishmentAmount <= 0 || !lastSpinResult.punishmentType) return
    onApplyPunishment?.(lastSpinResult.player, lastSpinResult.punishmentType, lastSpinResult.segment.punishmentAmount)
    setLastSpinResult({ ...lastSpinResult, applied: true })
  }

  const handleNext = () => {
    setLastSpinResult(null)
    if (currentPlayerIndex < playerQueue.length - 1) setCurrentPlayerIndex(currentPlayerIndex + 1)
    else setCurrentPlayerIndex(0)
  }

  const wheelScale = fullscreen ? { transform: "scale(1.3)", transformOrigin: "center center" } : { transform: "scale(0.65)", transformOrigin: "top center", marginBottom: "-150px" }

  const wheel = (
    <div className="relative" style={wheelScale}>
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
      {playerQueue.length > 0 && !lastSpinResult && (
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Spillere ({currentPlayerIndex + 1}/{playerQueue.length})</p>
            {playerQueue.length > 1 && <button onClick={() => { setPlayerQueue([]); setCurrentPlayerIndex(0); setLastSpinResult(null) }} className="text-xs text-red-500 hover:text-red-600" disabled={isSpinning}>Fjern alle</button>}
          </div>
          {playerQueue.map((player, index) => (
            <div key={player.user_id} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${index === currentPlayerIndex ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"}`}>
              <div className="flex items-center gap-2">
                <UserIcon className={`h-4 w-4 ${index === currentPlayerIndex ? "text-indigo-500" : "text-gray-400"}`} />
                <span className={`text-sm font-medium ${index === currentPlayerIndex ? "text-indigo-700 dark:text-indigo-300" : "text-gray-900 dark:text-gray-100"}`}>{player.first_name} {player.last_name}</span>
                {index === currentPlayerIndex && <span className="text-xs text-indigo-500 dark:text-indigo-400">(neste)</span>}
              </div>
              <button onClick={() => removePlayer(player.user_id)} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500" disabled={isSpinning}><XMarkIcon className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      {lastSpinResult && (
        <SpinResultCard
          player={lastSpinResult.player}
          resultLabel={lastSpinResult.segment.option}
          punishmentAmount={lastSpinResult.segment.punishmentAmount}
          punishmentType={lastSpinResult.punishmentType}
          applied={lastSpinResult.applied}
          onApply={handleApplyPunishment}
          onSkip={handleNext}
          hasMorePlayers={currentPlayerIndex < playerQueue.length - 1}
        />
      )}

      {!lastSpinResult && members.length > 0 && availableMembers.length > 0 && (
        <PlayerSearchDropdown members={availableMembers} onSelect={addPlayer} disabled={isSpinning} placeholder="Legg til spiller" />
      )}

      <div className="flex flex-row gap-x-2 w-full">
        <Button onClick={handleSpinClick} disabled={isSpinning || playerQueue.length === 0} className="flex-1">
          {isSpinning ? "Spinner..." : playerQueue.length === 0 ? "Legg til spillere" : "Spin!"}
        </Button>
        <button onClick={onEditSegments} className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700" title="Rediger hjulet"><PencilIcon className="h-5 w-5" /></button>
      </div>
    </div>
  )

  return <WheelLayout fullscreen={fullscreen} wheel={wheel} controls={controls} />
}

import { useState, useMemo, useEffect } from "react"
import { Wheel } from "react-custom-roulette"
import { usePlayMode, PunishmentTypeInfo } from "../../helpers/context/playModeContext"
import { Button } from "../button"
import { Group, GroupUser } from "../../helpers/types"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { usePunishmentTypes } from "./hooks"
import { PlayerSearchDropdown, WheelLayout, AmountSelector, SpinResultCard } from "./shared"
import { SEGMENT_COLORS } from "./utils/rouletteUtils"

interface PersonWheelProps {
  members?: GroupUser[]
  groupData?: Group
  onApplyPunishment?: (player: GroupUser, punishmentType: PunishmentTypeInfo, amount: number) => void
  fullscreen?: boolean
}

interface PersonSegment {
  option: string
  style: { backgroundColor: string; textColor: string }
  member: GroupUser
}

export const PersonWheel = ({ members = [], groupData, onApplyPunishment, fullscreen = false }: PersonWheelProps) => {
  const { isSpinning, setIsSpinning } = usePlayMode()
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const [selectedMember, setSelectedMember] = useState<GroupUser | null>(null)
  const [applied, setApplied] = useState(false)
  const [wheelMembers, setWheelMembers] = useState<GroupUser[]>([])
  const [selectedPunishmentType, setSelectedPunishmentType] = useState<PunishmentTypeInfo | null>(null)
  const [punishmentAmount, setPunishmentAmount] = useState(1)

  const { punishmentTypes } = usePunishmentTypes(groupData)

  useEffect(() => {
    if (punishmentTypes.length > 0 && !selectedPunishmentType) {
      setSelectedPunishmentType(punishmentTypes[0])
    }
  }, [punishmentTypes, selectedPunishmentType])

  const availableMembers = members.filter((m) => m.active && !wheelMembers.some((p) => p.user_id === m.user_id))

  const segments: PersonSegment[] = useMemo(() => {
    return wheelMembers.map((member, index) => ({
      option: member.first_name,
      style: { backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length], textColor: "white" },
      member,
    }))
  }, [wheelMembers])

  const addPlayer = (player: GroupUser) => setWheelMembers([...wheelMembers, player])
  const removePlayer = (userId: string) => setWheelMembers(wheelMembers.filter((p) => p.user_id !== userId))
  const canSpin = wheelMembers.length >= 2 && selectedPunishmentType !== null

  const handleSpinClick = () => {
    if (isSpinning || !canSpin) return
    setPrizeNumber(Math.floor(Math.random() * segments.length))
    setMustSpin(true)
    setIsSpinning(true)
    setSelectedMember(null)
    setApplied(false)
  }

  const handleSpinComplete = () => {
    setMustSpin(false)
    setIsSpinning(false)
    setSelectedMember(segments[prizeNumber].member)
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

  if (members.length === 0) {
    return <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">Ingen medlemmer i gruppen</div>
  }

  const wheelScale = fullscreen
    ? { transform: "scale(1.3)", transformOrigin: "center center" }
    : { transform: "scale(0.65)", transformOrigin: "top center", marginBottom: "-150px" }

  const wheel = (
    <div className="relative" style={wheelScale}>
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
          fontSize={fullscreen ? 16 : 12}
          spinDuration={0.6}
        />
      ) : (
        <div
          className={`rounded-full border-4 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center ${
            fullscreen ? "" : "mb-12 mt-4"
          }`}
          style={{ width: fullscreen ? 400 : 300, height: fullscreen ? 400 : 300 }}
        >
          <p
            className={`text-gray-400 dark:text-gray-500 text-center px-8 ${
              fullscreen ? "text-base text-white/60" : "text-sm"
            }`}
          >
            Legg til minst 2 personer for å spinne
          </p>
        </div>
      )}
    </div>
  )

  const controls = (
    <div className="flex flex-col gap-y-3 w-full">
      {selectedMember ? (
        <SpinResultCard
          player={selectedMember}
          resultLabel={`${selectedMember.first_name} ${selectedMember.last_name}`}
          punishmentAmount={punishmentAmount}
          punishmentType={selectedPunishmentType}
          applied={applied}
          onApply={handleApplyPunishment}
          onSkip={handleReset}
        />
      ) : (
        <>
          <div className="w-full">
            <p
              className={`text-xs font-medium mb-2 ${
                fullscreen ? "text-white/60" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Straff
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {punishmentTypes.map((pt) => (
                <button
                  key={pt.punishment_type_id}
                  onClick={() => setSelectedPunishmentType(pt)}
                  disabled={isSpinning}
                  className={`rounded-lg border px-2 py-1 text-xs font-medium transition-all ${
                    selectedPunishmentType?.punishment_type_id === pt.punishment_type_id
                      ? fullscreen
                        ? "border-indigo-400 bg-indigo-500/30 text-white"
                        : "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                      : fullscreen
                      ? "border-white/20 bg-white/10 text-white/80 hover:border-white/40"
                      : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  {pt.emoji} {pt.name}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full">
            <p
              className={`text-xs font-medium mb-2 ${
                fullscreen ? "text-white/60" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Antall
            </p>
            <AmountSelector
              value={punishmentAmount}
              onChange={setPunishmentAmount}
              disabled={isSpinning}
              fullscreen={fullscreen}
            />
          </div>

          {wheelMembers.length > 0 && (
            <div className="w-full space-y-1.5">
              <div className="flex items-center justify-between">
                <p
                  className={`text-xs font-medium ${fullscreen ? "text-white/60" : "text-gray-500 dark:text-gray-400"}`}
                >
                  Personer i hjulet ({wheelMembers.length})
                </p>
                {wheelMembers.length > 1 && (
                  <button
                    onClick={() => {
                      setWheelMembers([])
                      setSelectedMember(null)
                      setApplied(false)
                    }}
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

          {availableMembers.length > 0 && (
            <PlayerSearchDropdown
              members={availableMembers}
              onSelect={addPlayer}
              disabled={isSpinning}
              placeholder="Legg til person"
              buttonIcon="userPlus"
              fullscreen={fullscreen}
            />
          )}
        </>
      )}

      {!selectedMember && (
        <Button onClick={handleSpinClick} disabled={isSpinning || !canSpin} className="w-full">
          {isSpinning ? "Spinner..." : !canSpin ? "Legg til minst 2 personer" : "Spin!"}
        </Button>
      )}
    </div>
  )

  return <WheelLayout fullscreen={fullscreen} wheel={wheel} controls={controls} controlsTitle="Innstillinger" />
}

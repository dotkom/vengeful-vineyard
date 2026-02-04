import { useState, useEffect } from "react"
import { XMarkIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline"
import { Button } from "../button"
import { PlayerResult, WinnerAssignment } from "../../helpers/context/playModeContext"
import { GroupUser } from "../../helpers/types"
import { ModalWrapper, PlayerSearchDropdown } from "./shared"
import { calculateWinnings } from "./utils/rouletteUtils"

interface TargetAssignment {
  id: string
  player: GroupUser
  amount: number
}

interface WinnerAssignmentModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  winner: PlayerResult
  members: GroupUser[]
  onAssign: (assignments: WinnerAssignment[]) => void
}

export const WinnerAssignmentModal = ({ open, setOpen, winner, members, onAssign }: WinnerAssignmentModalProps) => {
  const [targets, setTargets] = useState<TargetAssignment[]>([])

  const stake = winner.entry.amount
  const punishmentType = winner.entry.punishmentType
  const totalWinnings = calculateWinnings(winner.entry.bet, stake)
  const assignedAmount = targets.reduce((sum, t) => sum + t.amount, 0)
  const remainingAmount = totalWinnings - assignedAmount

  useEffect(() => {
    if (open) setTargets([])
  }, [open])

  const availableMembers = members.filter(
    (m) => m.user_id !== winner.entry.player.user_id && !targets.some((t) => t.player.user_id === m.user_id)
  )

  const addTarget = (player: GroupUser) => {
    setTargets([
      ...targets,
      {
        id: `${player.user_id}-${Date.now()}`,
        player,
        amount: Math.min(Math.max(1, remainingAmount), remainingAmount),
      },
    ])
  }

  const removeTarget = (targetId: string) => setTargets(targets.filter((t) => t.id !== targetId))

  const updateTargetAmount = (targetId: string, newAmount: number) => {
    const otherTargetsTotal = targets.filter((t) => t.id !== targetId).reduce((sum, t) => sum + t.amount, 0)
    const maxForThis = totalWinnings - otherTargetsTotal
    setTargets(
      targets.map((t) => (t.id === targetId ? { ...t, amount: Math.max(1, Math.min(newAmount, maxForThis)) } : t))
    )
  }

  const handleConfirm = () => {
    onAssign(
      targets.map((t) => ({ fromWinner: winner.entry, targetPlayer: t.player, punishmentType, amount: t.amount }))
    )
    setOpen(false)
  }

  const header = (
    <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
      <h2 className="text-lg font-bold text-white">{winner.entry.player.first_name} vant!</h2>
      <p className="text-sm text-white/80">
        Fordel {totalWinnings} {punishmentType.name} {punishmentType.emoji}
      </p>
    </div>
  )

  return (
    <ModalWrapper open={open} onClose={() => setOpen(false)} header={header}>
      <div className="p-6">
        {targets.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Mottakere</p>
            {targets.map((target) => (
              <div
                key={target.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-3 py-2"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {target.player.first_name} {target.player.last_name}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateTargetAmount(target.id, target.amount - 1)}
                    disabled={target.amount <= 1}
                    className="rounded p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-gray-900 dark:text-gray-100">
                    {target.amount}
                  </span>
                  <button
                    onClick={() => updateTargetAmount(target.id, target.amount + 1)}
                    disabled={remainingAmount <= 0}
                    className="rounded p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeTarget(target.id)}
                    className="ml-2 rounded p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-red-500"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {availableMembers.length > 0 && remainingAmount > 0 && (
          <div className="mb-4">
            <PlayerSearchDropdown members={availableMembers} onSelect={addTarget} placeholder="Legg til mottaker" />
          </div>
        )}

        <div className="mb-4 rounded-lg bg-gray-100 dark:bg-gray-900 px-4 py-3 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {remainingAmount === 0 ? (
              <span className="text-green-600 dark:text-green-400 font-medium">Alt fordelt!</span>
            ) : (
              <>
                Gjenstår: <span className="font-bold text-gray-900 dark:text-gray-100">{remainingAmount}</span> av{" "}
                {totalWinnings} {punishmentType.emoji}
              </>
            )}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="OUTLINE" onClick={() => setOpen(false)}>
            Avbryt
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={targets.length === 0 || assignedAmount !== totalWinnings}
            color="GREEN"
          >
            Bekreft
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}

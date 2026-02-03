import { Fragment, useState, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon, MagnifyingGlassIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline"
import { Button } from "../button"
import { PlayerResult, WinnerAssignment, PunishmentTypeInfo } from "../../helpers/context/playModeContext"
import { GroupUser } from "../../helpers/types"
import { calculateWinnings } from "./BettingModal"

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

export const WinnerAssignmentModal = ({
  open,
  setOpen,
  winner,
  members,
  onAssign,
}: WinnerAssignmentModalProps) => {
  const [targets, setTargets] = useState<TargetAssignment[]>([])
  const [showMemberSelect, setShowMemberSelect] = useState(false)
  const [memberSearch, setMemberSearch] = useState("")

  const stake = winner.entry.amount
  const punishmentType = winner.entry.punishmentType
  const totalWinnings = calculateWinnings(winner.entry.bet, stake)
  const assignedAmount = targets.reduce((sum, t) => sum + t.amount, 0)
  const remainingAmount = totalWinnings - assignedAmount

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setTargets([])
      setShowMemberSelect(false)
      setMemberSearch("")
    }
  }, [open])

  // Filter out winner and already selected targets
  const availableMembers = members.filter(
    (member) =>
      member.user_id !== winner.entry.player.user_id &&
      !targets.some((t) => t.player.user_id === member.user_id)
  )

  const filteredMembers = availableMembers.filter((member) => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase()
    return fullName.includes(memberSearch.toLowerCase())
  })

  const addTarget = (player: GroupUser) => {
    const defaultAmount = Math.max(1, remainingAmount)
    setTargets([
      ...targets,
      {
        id: `${player.user_id}-${Date.now()}`,
        player,
        amount: Math.min(defaultAmount, remainingAmount),
      },
    ])
    setShowMemberSelect(false)
    setMemberSearch("")
  }

  const removeTarget = (targetId: string) => {
    setTargets(targets.filter((t) => t.id !== targetId))
  }

  const updateTargetAmount = (targetId: string, newAmount: number) => {
    const otherTargetsTotal = targets
      .filter((t) => t.id !== targetId)
      .reduce((sum, t) => sum + t.amount, 0)
    const maxForThis = totalWinnings - otherTargetsTotal
    const clampedAmount = Math.max(1, Math.min(newAmount, maxForThis))

    setTargets(
      targets.map((t) => (t.id === targetId ? { ...t, amount: clampedAmount } : t))
    )
  }

  const handleConfirm = () => {
    const assignments: WinnerAssignment[] = targets.map((t) => ({
      fromWinner: winner.entry,
      targetPlayer: t.player,
      punishmentType,
      amount: t.amount,
    }))
    onAssign(assignments)
    setOpen(false)
  }

  const canConfirm = targets.length > 0 && assignedAmount === totalWinnings

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-md transform rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute right-4 top-4 rounded-full p-1 text-white/70 hover:bg-white/20 hover:text-white"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                  <Dialog.Title className="text-lg font-bold text-white">
                    {winner.entry.player.first_name} vant!
                  </Dialog.Title>
                  <p className="text-sm text-white/80">
                    Fordel {totalWinnings} {punishmentType.name} {punishmentType.emoji}
                  </p>
                </div>

                <div className="p-6">
                  {/* Target List */}
                  {targets.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mottakere
                      </p>
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
                              onClick={() =>
                                updateTargetAmount(target.id, target.amount - 1)
                              }
                              disabled={target.amount <= 1}
                              className="rounded p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-gray-900 dark:text-gray-100">
                              {target.amount}
                            </span>
                            <button
                              onClick={() =>
                                updateTargetAmount(target.id, target.amount + 1)
                              }
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

                  {/* Add Target Button / Dropdown */}
                  {availableMembers.length > 0 && remainingAmount > 0 && (
                    <div className="relative mb-4">
                      <button
                        onClick={() => {
                          setShowMemberSelect(!showMemberSelect)
                          if (!showMemberSelect) setMemberSearch("")
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Legg til mottaker
                      </button>

                      {showMemberSelect && (
                        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg z-20">
                          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-2 py-1">
                              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                              <input
                                type="text"
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                                placeholder="Sok..."
                                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="max-h-32 overflow-y-auto">
                            {filteredMembers.length === 0 ? (
                              <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                Ingen treff
                              </p>
                            ) : (
                              filteredMembers.map((member) => (
                                <button
                                  key={member.user_id}
                                  onClick={() => addTarget(member)}
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

                  {/* Remaining Amount Indicator */}
                  <div className="mb-4 rounded-lg bg-gray-100 dark:bg-gray-900 px-4 py-3 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {remainingAmount === 0 ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          Alt fordelt!
                        </span>
                      ) : (
                        <>
                          Gjenstår:{" "}
                          <span className="font-bold text-gray-900 dark:text-gray-100">
                            {remainingAmount}
                          </span>{" "}
                          av {totalWinnings} {punishmentType.emoji}
                        </>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <Button variant="OUTLINE" onClick={() => setOpen(false)}>
                      Avbryt
                    </Button>
                    <Button onClick={handleConfirm} disabled={!canConfirm} color="GREEN">
                      Bekreft
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

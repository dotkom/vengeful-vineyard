import { useState, useEffect } from "react"
import { XMarkIcon, CheckIcon, ExclamationTriangleIcon, CheckCircleIcon, GiftIcon } from "@heroicons/react/24/outline"
import { Button } from "../button"
import { PlayerResult, WinnerAssignment } from "../../helpers/context/playModeContext"
import { GroupUser } from "../../helpers/types"
import { WinnerAssignmentModal } from "./WinnerAssignmentModal"
import { ModalWrapper } from "./shared"
import { getNumberColor, getBetLabel, calculateWinnings } from "./utils/rouletteUtils"

interface ResultsModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  resultNumber: number | null
  playerResults: PlayerResult[]
  onApplyPunishments: (losers: PlayerResult[], winnerAssignments: WinnerAssignment[]) => void
  onClose: () => void
  alreadyApplied?: boolean
  members?: GroupUser[]
}

export const ResultsModal = ({
  open,
  setOpen,
  resultNumber,
  playerResults,
  onApplyPunishments,
  onClose,
  alreadyApplied = false,
  members = [],
}: ResultsModalProps) => {
  const [confirmStep, setConfirmStep] = useState(0)
  const [winnerAssignments, setWinnerAssignments] = useState<WinnerAssignment[]>([])
  const [assigningWinner, setAssigningWinner] = useState<PlayerResult | null>(null)

  useEffect(() => {
    if (open) {
      setConfirmStep(0)
      setWinnerAssignments([])
      setAssigningWinner(null)
    }
  }, [open])

  const losers = playerResults.filter((r) => !r.won)
  const winners = playerResults.filter((r) => r.won)

  const getWinnerAssignments = (winnerId: string) => winnerAssignments.filter((a) => a.fromWinner.id === winnerId)
  const hasWinnerAssigned = (winnerId: string) => getWinnerAssignments(winnerId).length > 0

  const handleClose = () => {
    setConfirmStep(0)
    setWinnerAssignments([])
    setAssigningWinner(null)
    setOpen(false)
    onClose()
  }

  const handleApply = () => {
    const hasPunishmentsToApply = losers.length > 0 || winnerAssignments.length > 0
    if (confirmStep === 0) {
      if (!hasPunishmentsToApply) {
        handleClose()
        return
      }
      setConfirmStep(1)
    } else if (confirmStep === 1) setConfirmStep(2)
    else {
      onApplyPunishments(losers, winnerAssignments)
      handleClose()
    }
  }

  const handleWinnerAssign = (assignments: WinnerAssignment[]) => {
    const winnerId = assignments[0]?.fromWinner.id
    if (winnerId)
      setWinnerAssignments([...winnerAssignments.filter((a) => a.fromWinner.id !== winnerId), ...assignments])
    setAssigningWinner(null)
  }

  if (resultNumber === null) return null

  const resultColor = getNumberColor(resultNumber)
  const loserPunishments = losers.reduce((sum, r) => sum + r.entry.amount, 0)
  const winnerAssignmentPunishments = winnerAssignments.reduce((sum, a) => sum + a.amount, 0)
  const totalPunishments = loserPunishments + winnerAssignmentPunishments

  const punishmentSummary = [
    ...losers,
    ...winnerAssignments.map((a) => ({ entry: { amount: a.amount, punishmentType: a.punishmentType } })),
  ].reduce(
    (acc, r) => {
      const key = `${r.entry.punishmentType.name} ${r.entry.punishmentType.emoji}`
      acc[key] = (acc[key] || 0) + r.entry.amount
      return acc
    },
    {} as Record<string, number>
  )

  const uniqueRecipients = new Set([
    ...losers.map((l) => l.entry.player.user_id),
    ...winnerAssignments.map((a) => a.targetPlayer.user_id),
  ]).size

  const headerBg =
    resultColor === "red"
      ? "bg-gradient-to-r from-red-500 to-red-600"
      : resultColor === "black"
      ? "bg-gradient-to-r from-gray-700 to-gray-800"
      : "bg-gradient-to-r from-green-500 to-green-600"

  const header = (
    <div className={`px-6 py-4 text-center ${headerBg}`}>
      <p className="text-sm font-medium text-white/80">Resultat</p>
      <p className="text-5xl font-bold text-white">{resultNumber}</p>
      {alreadyApplied && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
          <CheckCircleIcon className="h-3 w-3" />
          Straff lagt til
        </div>
      )}
    </div>
  )

  return (
    <>
      <ModalWrapper open={open} onClose={handleClose} header={header}>
        <div className="p-6">
          {confirmStep === 0 &&
            (playerResults.length > 0 ? (
              <div className="space-y-3">
                {winners.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Vinnere</p>
                    {winners.map((r) => {
                      const assigned = hasWinnerAssigned(r.entry.id)
                      const assignments = getWinnerAssignments(r.entry.id)
                      const winnings = calculateWinnings(r.entry.bet, r.entry.amount)
                      return (
                        <div key={r.entry.id} className="rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2 mb-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {r.entry.player.first_name} {r.entry.player.last_name}
                              </span>
                              <p className="text-xs text-green-600 dark:text-green-400">
                                Vant {winnings} {r.entry.punishmentType.name} {r.entry.punishmentType.emoji}
                              </p>
                            </div>
                            <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                              <CheckIcon className="h-4 w-4" />
                              {getBetLabel(r.entry.bet)}
                            </span>
                          </div>
                          {!alreadyApplied && members.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                              {assigned ? (
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    Gir til:{" "}
                                    {assignments.map((a, i) => (
                                      <span key={a.targetPlayer.user_id}>
                                        {i > 0 && ", "}
                                        {a.targetPlayer.first_name} ({a.amount})
                                      </span>
                                    ))}
                                  </div>
                                  <button
                                    onClick={() => setAssigningWinner(r)}
                                    className="text-xs text-green-600 dark:text-green-400 hover:underline"
                                  >
                                    Endre
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setAssigningWinner(r)}
                                  className="flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
                                >
                                  <GiftIcon className="h-3.5 w-3.5" />
                                  Gi straff til andre
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                {losers.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Tapere</p>
                    {losers.map((r) => (
                      <div
                        key={r.entry.id}
                        className="flex items-center justify-between rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 mb-1"
                      >
                        <div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {r.entry.player.first_name} {r.entry.player.last_name}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {r.entry.amount} {r.entry.punishmentType.name} {r.entry.punishmentType.emoji}
                          </p>
                        </div>
                        <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                          <XMarkIcon className="h-4 w-4" />
                          {getBetLabel(r.entry.bet)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">Ingen spillere la innsats</p>
            ))}

          {confirmStep === 1 && (
            <div className="text-center py-4">
              <ExclamationTriangleIcon className="h-12 w-12 text-amber-500 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Legg til straff?</p>
              {losers.length > 0 && (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {losers.length} {losers.length === 1 ? "taper" : "tapere"}:
                  </p>
                  <div className="space-y-1 mb-3">
                    {losers.map((r) => (
                      <p key={r.entry.id} className="text-sm text-gray-700 dark:text-gray-300">
                        {r.entry.player.first_name} {r.entry.player.last_name}
                        <span className="text-gray-500">
                          {" "}
                          — {r.entry.amount} {r.entry.punishmentType.name} {r.entry.punishmentType.emoji}
                        </span>
                      </p>
                    ))}
                  </div>
                </>
              )}
              {winnerAssignments.length > 0 && (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Fra vinnere:</p>
                  <div className="space-y-1 mb-3">
                    {winnerAssignments.map((a, i) => (
                      <p key={i} className="text-sm text-gray-700 dark:text-gray-300">
                        {a.targetPlayer.first_name} {a.targetPlayer.last_name}
                        <span className="text-gray-500">
                          {" "}
                          — {a.amount} {a.punishmentType.name} {a.punishmentType.emoji}
                        </span>
                        <span className="text-gray-400 text-xs"> (fra {a.fromWinner.player.first_name})</span>
                      </p>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {confirmStep === 2 && (
            <div className="text-center py-4">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Er du sikker?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dette legger til totalt {totalPunishments} straff{totalPunishments !== 1 ? "er" : ""} på{" "}
                {uniqueRecipients} {uniqueRecipients === 1 ? "person" : "personer"}:
              </p>
              <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {Object.entries(punishmentSummary).map(([type, count]) => (
                  <p key={type}>
                    {count} {type}
                  </p>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Denne handlingen kan ikke angres.</p>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="OUTLINE" onClick={handleClose}>
              {confirmStep === 0 ? "Lukk" : "Avbryt"}
            </Button>
            {!alreadyApplied && (losers.length > 0 || winnerAssignments.length > 0 || confirmStep === 0) && (
              <Button onClick={handleApply} color={confirmStep === 2 ? "RED" : confirmStep === 1 ? "YELLOW" : "GREEN"}>
                {confirmStep === 0
                  ? losers.length > 0 || winnerAssignments.length > 0
                    ? "Legg til straff"
                    : "Ferdig"
                  : confirmStep === 1
                  ? "Bekreft"
                  : "Ja, legg til straff"}
              </Button>
            )}
          </div>
        </div>
      </ModalWrapper>

      {assigningWinner && (
        <WinnerAssignmentModal
          open={!!assigningWinner}
          setOpen={(open) => !open && setAssigningWinner(null)}
          winner={assigningWinner}
          members={members}
          onAssign={handleWinnerAssign}
        />
      )}
    </>
  )
}

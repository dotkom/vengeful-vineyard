import { Fragment, useState, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon, CheckIcon, ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import { Button } from "../button"
import { PlayerResult } from "../../helpers/context/playModeContext"
import { getNumberColor, BetType } from "./BettingModal"

interface ResultsModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  resultNumber: number | null
  playerResults: PlayerResult[]
  onApplyPunishments: (losers: PlayerResult[]) => void
  onClose: () => void
  alreadyApplied?: boolean
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

export const ResultsModal = ({
  open,
  setOpen,
  resultNumber,
  playerResults,
  onApplyPunishments,
  onClose,
  alreadyApplied = false,
}: ResultsModalProps) => {
  const [confirmStep, setConfirmStep] = useState(0) // 0 = show results, 1 = first confirm, 2 = final confirm

  // Reset confirm step when modal opens
  useEffect(() => {
    if (open) {
      setConfirmStep(0)
    }
  }, [open])

  const losers = playerResults.filter((r) => !r.won)
  const winners = playerResults.filter((r) => r.won)

  const handleClose = () => {
    setConfirmStep(0)
    setOpen(false)
    onClose()
  }

  const handleApply = () => {
    if (confirmStep === 0) {
      if (losers.length === 0) {
        handleClose()
        return
      }
      setConfirmStep(1)
    } else if (confirmStep === 1) {
      setConfirmStep(2)
    } else {
      onApplyPunishments(losers)
      handleClose()
    }
  }

  if (resultNumber === null) return null

  const resultColor = getNumberColor(resultNumber)

  // Calculate total punishments to be applied
  const totalPunishments = losers.reduce((sum, r) => sum + r.entry.amount, 0)
  const punishmentSummary = losers.reduce((acc, r) => {
    const key = `${r.entry.punishmentType.name} ${r.entry.punishmentType.emoji}`
    acc[key] = (acc[key] || 0) + r.entry.amount
    return acc
  }, {} as Record<string, number>)

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
              <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all">
                {/* Header with result */}
                <div
                  className={`px-6 py-4 text-center ${
                    resultColor === "red"
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : resultColor === "black"
                      ? "bg-gradient-to-r from-gray-700 to-gray-800"
                      : "bg-gradient-to-r from-green-500 to-green-600"
                  }`}
                >
                  <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 rounded-full p-1 text-white/70 hover:bg-white/20 hover:text-white"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                  <p className="text-sm font-medium text-white/80">Resultat</p>
                  <p className="text-5xl font-bold text-white">{resultNumber}</p>
                  {alreadyApplied && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
                      <CheckCircleIcon className="h-3 w-3" />
                      Straff lagt til
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {confirmStep === 0 && (
                    <>
                      {/* Player Results */}
                      {playerResults.length > 0 ? (
                        <div className="space-y-3">
                          {winners.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Vinnere</p>
                              {winners.map((r) => (
                                <div
                                  key={r.entry.id}
                                  className="flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2 mb-1"
                                >
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {r.entry.player.first_name} {r.entry.player.last_name}
                                  </span>
                                  <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                                    <CheckIcon className="h-4 w-4" />
                                    {getBetLabel(r.entry.bet)}
                                  </span>
                                </div>
                              ))}
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
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                          Ingen spillere la innsats
                        </p>
                      )}
                    </>
                  )}

                  {confirmStep === 1 && (
                    <div className="text-center py-4">
                      <ExclamationTriangleIcon className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Legg til straff?
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {losers.length} {losers.length === 1 ? "person" : "personer"} tapte:
                      </p>
                      <div className="space-y-1 mb-3">
                        {losers.map((r) => (
                          <p key={r.entry.id} className="text-sm text-gray-700 dark:text-gray-300">
                            {r.entry.player.first_name} {r.entry.player.last_name}
                            <span className="text-gray-500"> — {r.entry.amount} {r.entry.punishmentType.name} {r.entry.punishmentType.emoji}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {confirmStep === 2 && (
                    <div className="text-center py-4">
                      <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-3" />
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Er du sikker?
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Dette legger til totalt {totalPunishments} straff{totalPunishments !== 1 ? "er" : ""} på {losers.length} {losers.length === 1 ? "person" : "personer"}:
                      </p>
                      <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {Object.entries(punishmentSummary).map(([type, count]) => (
                          <p key={type}>{count} {type}</p>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        Denne handlingen kan ikke angres.
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="OUTLINE" onClick={handleClose}>
                      {confirmStep === 0 ? "Lukk" : "Avbryt"}
                    </Button>
                    {!alreadyApplied && (losers.length > 0 || confirmStep === 0) && (
                      <Button
                        onClick={handleApply}
                        color={confirmStep === 2 ? "RED" : confirmStep === 1 ? "YELLOW" : "GREEN"}
                      >
                        {confirmStep === 0
                          ? losers.length > 0
                            ? "Legg til straff"
                            : "Ferdig"
                          : confirmStep === 1
                          ? "Bekreft"
                          : "Ja, legg til straff"}
                      </Button>
                    )}
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

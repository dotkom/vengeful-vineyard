import { Fragment, useState, useEffect, Dispatch, SetStateAction } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline"
import { Button } from "../button"
import { PunishmentTypeInfo } from "../../helpers/context/playModeContext"

export type BetType =
  | { type: "number"; value: number }
  | { type: "color"; value: "red" | "black" }
  | { type: "evenOdd"; value: "even" | "odd" }
  | { type: "highLow"; value: "high" | "low" }
  | { type: "dozen"; value: 1 | 2 | 3 }

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

const getNumberColor = (num: number): "red" | "black" | "green" => {
  if (num === 0) return "green"
  return RED_NUMBERS.includes(num) ? "red" : "black"
}

// Get payout multiplier for a bet type (excluding the original stake)
const getPayoutMultiplier = (bet: BetType): number => {
  switch (bet.type) {
    case "number": return 35 // 35:1
    case "color": return 1   // 1:1
    case "evenOdd": return 1 // 1:1
    case "highLow": return 1 // 1:1
    case "dozen": return 2   // 2:1
  }
}

// Calculate total winnings (stake * multiplier)
const calculateWinnings = (bet: BetType, stake: number): number => {
  return stake * getPayoutMultiplier(bet)
}

interface BettingModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  onPlaceBet: (bet: BetType) => void
  currentBet: BetType | null
  playerName?: string
  punishmentTypes?: PunishmentTypeInfo[]
  selectedPunishmentType?: PunishmentTypeInfo | null
  onPunishmentTypeChange?: Dispatch<SetStateAction<PunishmentTypeInfo | null>>
  amount?: number
  onAmountChange?: Dispatch<SetStateAction<number>>
}

export const BettingModal = ({
  open,
  setOpen,
  onPlaceBet,
  currentBet,
  playerName,
  punishmentTypes = [],
  selectedPunishmentType,
  onPunishmentTypeChange,
  amount = 1,
  onAmountChange,
}: BettingModalProps) => {
  const [selectedBet, setSelectedBet] = useState<BetType | null>(currentBet)
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  // Reset selected bet when modal opens with a new currentBet
  useEffect(() => {
    if (open) {
      setSelectedBet(currentBet)
    }
  }, [open, currentBet])

  const handleConfirm = () => {
    if (selectedBet) {
      onPlaceBet(selectedBet)
      setOpen(false)
    }
  }

  const BetButton = ({
    bet,
    label,
    className = "",
    size = "normal",
  }: {
    bet: BetType
    label: string
    className?: string
    size?: "small" | "normal"
  }) => {
    const isSelected =
      selectedBet?.type === bet.type &&
      JSON.stringify(selectedBet.value) === JSON.stringify(bet.value)

    return (
      <button
        onClick={() => setSelectedBet(isSelected ? null : bet)}
        className={`rounded font-bold transition-all ${
          size === "small" ? "px-1 py-0.5 text-[10px]" : "px-2 py-1.5 text-xs"
        } ${
          isSelected
            ? "ring-2 ring-yellow-400 ring-offset-2 scale-105"
            : "hover:opacity-90 hover:scale-102"
        } ${className}`}
      >
        {label}
      </button>
    )
  }

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
              <Dialog.Panel className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 p-6 shadow-2xl transition-all border-4 border-amber-600">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Dialog.Title className="text-xl font-bold text-amber-400">
                      Plasser innsats
                    </Dialog.Title>
                    {playerName && (
                      <p className="text-sm text-gray-400">for {playerName}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* How it works info - collapsible */}
                <div className="mb-4 rounded-lg bg-indigo-950/50 border border-indigo-800">
                  <button
                    type="button"
                    onClick={() => setShowHowItWorks(!showHowItWorks)}
                    className="w-full flex items-center justify-between p-3 text-left"
                  >
                    <span className="text-sm font-medium text-indigo-300">Hvordan fungerer det?</span>
                    <ChevronDownIcon className={`h-4 w-4 text-indigo-400 transition-transform ${showHowItWorks ? "rotate-180" : ""}`} />
                  </button>
                  {showHowItWorks && (
                    <div className="px-3 pb-3">
                      <ul className="text-xs text-indigo-200/80 space-y-1.5">
                        <li><span className="text-red-400">Taper du:</span> Du får straffen du satset</li>
                        <li><span className="text-green-400">Vinner du:</span> Du kan gi straff til andre basert på odds!</li>
                      </ul>
                      <div className="mt-3 pt-2 border-t border-indigo-800/50">
                        <p className="text-xs font-medium text-indigo-300 mb-1">Eksempel:</p>
                        <p className="text-xs text-indigo-200/70">
                          Du satser 2 shots på <span className="text-red-400">rød (1:1)</span>.
                          Taper du = 2 shots til deg.
                          Vinner du = gi 2 shots til en annen!
                        </p>
                        <p className="text-xs text-indigo-200/70 mt-1">
                          Satser du på <span className="text-amber-400">nummer 17 (35:1)</span> med 1 shot og vinner = gi 35 shots til andre!
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Punishment Type & Amount Selection */}
                {onPunishmentTypeChange && onAmountChange && (
                  <div className="mb-4 rounded-lg bg-gray-950/50 p-3 border border-gray-700">
                    <p className="mb-2 text-sm font-medium text-gray-300">Innsats (straff ved tap)</p>
                    {punishmentTypes.length > 0 ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          max={15}
                          value={amount}
                          onChange={(e) => onAmountChange(Number(e.target.value))}
                          className="w-16 rounded-md border border-gray-600 bg-gray-800 px-2 py-1.5 text-center text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        />
                        <select
                          value={selectedPunishmentType?.punishment_type_id || ""}
                          onChange={(e) => {
                            const pt = punishmentTypes.find((p) => p.punishment_type_id === e.target.value)
                            if (pt) onPunishmentTypeChange(pt)
                          }}
                          className="flex-1 rounded-md border border-gray-600 bg-gray-800 px-2 py-1.5 text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        >
                          {punishmentTypes.map((pt) => (
                            <option key={pt.punishment_type_id} value={pt.punishment_type_id}>
                              {pt.name} {pt.emoji}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <p className="text-sm text-amber-400">
                        Ingen straffetyper funnet. Legg til straffetyper i gruppeinnstillingene.
                      </p>
                    )}
                  </div>
                )}

                {/* Number Grid */}
                <div className="mb-4">
                  <p className="mb-2 text-sm font-medium text-gray-300">Velg et nummer (35:1)</p>
                  <div className="grid grid-cols-10 gap-1">
                    {/* Zero - distinct bright green */}
                    <BetButton
                      bet={{ type: "number", value: 0 }}
                      label="0"
                      className="col-span-10 bg-emerald-500 text-white border border-emerald-400"
                      size="normal"
                    />
                    {/* Numbers 1-36 */}
                    {[...Array(36)].map((_, i) => {
                      const num = i + 1
                      const color = getNumberColor(num)
                      return (
                        <BetButton
                          key={num}
                          bet={{ type: "number", value: num }}
                          label={String(num)}
                          className={`${
                            color === "red"
                              ? "bg-red-600 text-white border border-red-500"
                              : "bg-gray-950 text-white border border-gray-700"
                          }`}
                          size="small"
                        />
                      )
                    })}
                  </div>
                </div>

                {/* Outside Bets */}
                <div className="mb-4">
                  <p className="mb-2 text-sm font-medium text-gray-300">Eller velg type (1:1 = vinn like mye som du satset)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <BetButton
                      bet={{ type: "color", value: "red" }}
                      label="Rød (1:1)"
                      className="bg-red-600 text-white border border-red-500"
                    />
                    <BetButton
                      bet={{ type: "color", value: "black" }}
                      label="Svart (1:1)"
                      className="bg-gray-950 text-white border border-gray-600"
                    />
                    <BetButton
                      bet={{ type: "evenOdd", value: "even" }}
                      label="Partall (1:1)"
                      className="bg-gray-700 text-white border border-gray-500"
                    />
                    <BetButton
                      bet={{ type: "evenOdd", value: "odd" }}
                      label="Oddetall (1:1)"
                      className="bg-gray-700 text-white border border-gray-500"
                    />
                    <BetButton
                      bet={{ type: "highLow", value: "low" }}
                      label="1-18 (1:1)"
                      className="bg-gray-700 text-white border border-gray-500"
                    />
                    <BetButton
                      bet={{ type: "highLow", value: "high" }}
                      label="19-36 (1:1)"
                      className="bg-gray-700 text-white border border-gray-500"
                    />
                  </div>
                </div>

                {/* Dozens */}
                <div className="mb-4">
                  <p className="mb-2 text-sm font-medium text-gray-300">Dusin (2:1 = vinn dobbelt av innsats)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <BetButton
                      bet={{ type: "dozen", value: 1 }}
                      label="1-12"
                      className="bg-amber-700 text-white border border-amber-600"
                    />
                    <BetButton
                      bet={{ type: "dozen", value: 2 }}
                      label="13-24"
                      className="bg-amber-700 text-white border border-amber-600"
                    />
                    <BetButton
                      bet={{ type: "dozen", value: 3 }}
                      label="25-36"
                      className="bg-amber-700 text-white border border-amber-600"
                    />
                  </div>
                </div>

                {/* Selected Bet Display */}
                {selectedBet && (
                  <div className="mb-4 rounded-lg bg-gray-950/50 p-3 text-center border border-gray-700">
                    <p className="text-sm text-gray-400">Din innsats:</p>
                    <p className="text-lg font-bold text-amber-400">
                      {selectedBet.type === "number" && `Nummer ${selectedBet.value}`}
                      {selectedBet.type === "color" && (selectedBet.value === "red" ? "Rød" : "Svart")}
                      {selectedBet.type === "evenOdd" && (selectedBet.value === "even" ? "Partall" : "Oddetall")}
                      {selectedBet.type === "highLow" && (selectedBet.value === "low" ? "Lav (1-18)" : "Høy (19-36)")}
                      {selectedBet.type === "dozen" && `Dusin ${selectedBet.value} (${(selectedBet.value - 1) * 12 + 1}-${selectedBet.value * 12})`}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button variant="OUTLINE" onClick={() => setOpen(false)}>
                    Avbryt
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={!selectedBet || (onPunishmentTypeChange && punishmentTypes.length === 0)}
                    color="GREEN"
                  >
                    Bekreft innsats
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export { getNumberColor, getPayoutMultiplier, calculateWinnings }

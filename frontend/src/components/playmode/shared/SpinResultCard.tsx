import { Button } from "../../button"
import { GroupUser } from "../../../helpers/types"
import { PunishmentTypeInfo } from "../../../helpers/context/playModeContext"

interface SpinResultCardProps {
  player: GroupUser
  resultLabel: string
  punishmentAmount: number
  punishmentType: PunishmentTypeInfo | null
  applied: boolean
  onApply: () => void
  onSkip: () => void
  hasMorePlayers?: boolean
}

export const SpinResultCard = ({
  player,
  resultLabel,
  punishmentAmount,
  punishmentType,
  applied,
  onApply,
  onSkip,
  hasMorePlayers = false,
}: SpinResultCardProps) => {
  const hasPunishment = punishmentAmount > 0 && punishmentType

  return (
    <div className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-3">
      <div className="text-center mb-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">Resultat for</p>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {player.first_name} {player.last_name}
        </p>
        <p className={`text-lg font-bold ${hasPunishment ? "text-red-500" : "text-green-500"}`}>
          {resultLabel}
          {punishmentType && ` ${punishmentType.emoji}`}
        </p>
      </div>

      {!applied && hasPunishment && (
        <div className="flex gap-2">
          <Button variant="OUTLINE" onClick={onSkip} className="flex-1">
            Hopp over
          </Button>
          <Button color="RED" onClick={onApply} className="flex-1">
            Gi straff
          </Button>
        </div>
      )}

      {applied && (
        <div className="space-y-2">
          <p className="text-center text-sm text-green-600 dark:text-green-400">Straff lagt til!</p>
          <Button variant="OUTLINE" onClick={onSkip} className="w-full">
            {hasMorePlayers ? "Neste spiller" : "Ferdig"}
          </Button>
        </div>
      )}

      {!applied && !hasPunishment && (
        <Button variant="OUTLINE" onClick={onSkip} className="w-full">
          {hasMorePlayers ? "Neste spiller" : "Ferdig"}
        </Button>
      )}
    </div>
  )
}

import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react"
import { BetType } from "../../components/playmode/BettingModal"
import { GroupUser } from "../types"

export interface RouletteResult {
  segmentIndex: number
  segmentLabel: string
  punishmentAmount: number
}

export interface PunishmentTypeInfo {
  punishment_type_id: string
  name: string
  emoji: string
  value: number
}

export interface PlayerBetEntry {
  id: string
  player: GroupUser
  bet: BetType
  punishmentType: PunishmentTypeInfo
  amount: number
}

export interface PlayerResult {
  entry: PlayerBetEntry
  won: boolean
  resultNumber: number
}

export interface CasinoSpinResult {
  resultNumber: number
  playerResults: PlayerResult[]
  applied: boolean
}

export interface WinnerAssignment {
  fromWinner: PlayerBetEntry
  targetPlayer: GroupUser
  punishmentType: PunishmentTypeInfo
  amount: number
}

interface PlayModeContextProps {
  isPlayModeEnabled: boolean
  setIsPlayModeEnabled: Dispatch<SetStateAction<boolean>>
  isSpinning: boolean
  setIsSpinning: Dispatch<SetStateAction<boolean>>
  lastResult: RouletteResult | null
  setLastResult: Dispatch<SetStateAction<RouletteResult | null>>
  playerEntries: PlayerBetEntry[]
  setPlayerEntries: Dispatch<SetStateAction<PlayerBetEntry[]>>
  playerResults: PlayerResult[]
  setPlayerResults: Dispatch<SetStateAction<PlayerResult[]>>
  lastCasinoSpin: CasinoSpinResult | null
  setLastCasinoSpin: Dispatch<SetStateAction<CasinoSpinResult | null>>
}

const PlayModeContext = createContext<PlayModeContextProps | undefined>(undefined)

export function usePlayMode() {
  const context = useContext(PlayModeContext)
  if (!context) {
    throw new Error("usePlayMode must be used within a PlayModeProvider")
  }

  return context
}

interface PlayModeProviderProps {
  children: ReactNode
}

export function PlayModeProvider({ children }: PlayModeProviderProps) {
  const [isPlayModeEnabled, setIsPlayModeEnabled] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [lastResult, setLastResult] = useState<RouletteResult | null>(null)
  const [playerEntries, setPlayerEntries] = useState<PlayerBetEntry[]>([])
  const [playerResults, setPlayerResults] = useState<PlayerResult[]>([])
  const [lastCasinoSpin, setLastCasinoSpin] = useState<CasinoSpinResult | null>(null)

  return (
    <PlayModeContext.Provider
      value={{
        isPlayModeEnabled,
        setIsPlayModeEnabled,
        isSpinning,
        setIsSpinning,
        lastResult,
        setLastResult,
        playerEntries,
        setPlayerEntries,
        playerResults,
        setPlayerResults,
        lastCasinoSpin,
        setLastCasinoSpin,
      }}
    >
      {children}
    </PlayModeContext.Provider>
  )
}

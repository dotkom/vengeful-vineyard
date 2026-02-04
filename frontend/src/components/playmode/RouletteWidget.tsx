import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { CasinoRoulette } from "./CasinoRoulette"
import { CustomWheel, WheelSegment, DEFAULT_SEGMENTS } from "./CustomWheel"
import { PersonWheel } from "./PersonWheel"
import { SegmentEditorModal } from "./SegmentEditorModal"
import { Group, GroupUser, PunishmentCreate } from "../../helpers/types"
import { PlayerResult, PunishmentTypeInfo, WinnerAssignment } from "../../helpers/context/playModeContext"
import { useNotification } from "../../helpers/context/notificationContext"
import { usePunishmentTypes } from "./hooks"

type WheelMode = "casino" | "custom"
type LykkehjulMode = "straff" | "person"

interface RouletteWidgetProps {
  members?: GroupUser[]
  groupData?: Group
  fullscreen?: boolean
}

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export const RouletteWidget = ({ members = [], groupData, fullscreen = false }: RouletteWidgetProps) => {
  const [mode, setMode] = useState<WheelMode>("casino")
  const [lykkehjulMode, setLykkehjulMode] = useState<LykkehjulMode>("straff")
  const [segments, setSegments] = useState<WheelSegment[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const queryClient = useQueryClient()
  const { setNotification } = useNotification()
  const { punishmentTypes } = usePunishmentTypes(groupData)


  const handleApplyPunishments = async (losers: PlayerResult[], winnerAssignments: WinnerAssignment[] = []) => {
    if (!groupData?.group_id) return

    try {
      // Apply punishment to each loser using their specific punishment type and amount
      for (const loser of losers) {
        const punishmentData: PunishmentCreate = {
          punishment_type_id: loser.entry.punishmentType.punishment_type_id,
          reason: "Roulette gambling 🎰",
          reason_hidden: false,
          amount: loser.entry.amount,
        }

        await axios.post(
          `${BASE_URL}/groups/${groupData.group_id}/users/${loser.entry.player.user_id}/punishments`,
          [punishmentData]
        )
      }

      // Apply punishments from winner assignments
      for (const assignment of winnerAssignments) {
        const punishmentData: PunishmentCreate = {
          punishment_type_id: assignment.punishmentType.punishment_type_id,
          reason: `Roulette fra ${assignment.fromWinner.player.first_name} 🎰`,
          reason_hidden: false,
          amount: assignment.amount,
        }

        await axios.post(
          `${BASE_URL}/groups/${groupData.group_id}/users/${assignment.targetPlayer.user_id}/punishments`,
          [punishmentData]
        )
      }

      // Invalidate queries to refresh the UI
      await queryClient.invalidateQueries({
        queryKey: ["groupLeaderboard", groupData.group_id],
      })
      await queryClient.invalidateQueries({ queryKey: ["leaderboard"] })

      // Build summary of punishments applied (losers + winner assignments)
      const allPunishments = [
        ...losers.map(r => ({ amount: r.entry.amount, punishmentType: r.entry.punishmentType })),
        ...winnerAssignments.map(a => ({ amount: a.amount, punishmentType: a.punishmentType })),
      ]

      const summary = allPunishments.reduce((acc, p) => {
        const key = `${p.punishmentType.name} ${p.punishmentType.emoji}`
        acc[key] = (acc[key] || 0) + p.amount
        return acc
      }, {} as Record<string, number>)

      const summaryText = Object.entries(summary)
        .map(([type, count]) => `${count} ${type}`)
        .join(", ")

      const totalRecipients = new Set([
        ...losers.map(l => l.entry.player.user_id),
        ...winnerAssignments.map(a => a.targetPlayer.user_id),
      ]).size

      setNotification({
        type: "success",
        title: "Straff lagt til",
        text: `${totalRecipients} ${totalRecipients === 1 ? "person" : "personer"} fikk straff: ${summaryText}`,
      })
    } catch (error: any) {
      setNotification({
        type: "error",
        title: "Kunne ikke legge til straff",
        text: error?.response?.data?.detail || "En feil oppstod",
      })
    }
  }

  const handleApplySinglePunishment = async (player: GroupUser, punishmentType: PunishmentTypeInfo, amount: number) => {
    if (!groupData?.group_id) return

    try {
      const punishmentData: PunishmentCreate = {
        punishment_type_id: punishmentType.punishment_type_id,
        reason: "Lykkehjul 🎡",
        reason_hidden: false,
        amount,
      }

      await axios.post(
        `${BASE_URL}/groups/${groupData.group_id}/users/${player.user_id}/punishments`,
        [punishmentData]
      )

      await queryClient.invalidateQueries({
        queryKey: ["groupLeaderboard", groupData.group_id],
      })
      await queryClient.invalidateQueries({ queryKey: ["leaderboard"] })

      setNotification({
        type: "success",
        title: "Straff lagt til",
        text: `${player.first_name} fikk ${amount} ${punishmentType.name} ${punishmentType.emoji}`,
      })
    } catch (error: any) {
      setNotification({
        type: "error",
        title: "Kunne ikke legge til straff",
        text: error?.response?.data?.detail || "En feil oppstod",
      })
    }
  }

  const modeSwitcher = (
    <div className={`flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 ${fullscreen ? "bg-white/10" : ""}`}>
      <button
        onClick={() => setMode("casino")}
        className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
          mode === "casino"
            ? fullscreen
              ? "bg-white/20 text-white shadow-sm"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
            : fullscreen
              ? "text-white/60 hover:text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        }`}
      >
        Casino
      </button>
      <button
        onClick={() => setMode("custom")}
        className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
          mode === "custom"
            ? fullscreen
              ? "bg-white/20 text-white shadow-sm"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
            : fullscreen
              ? "text-white/60 hover:text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        }`}
      >
        Lykkehjul
      </button>
    </div>
  )

  const lykkehjulSubModeSwitcher = mode === "custom" && (
    <div className={`flex rounded-lg p-0.5 ${fullscreen ? "bg-white/10" : "bg-gray-50 dark:bg-gray-800"}`}>
      <button
        onClick={() => setLykkehjulMode("straff")}
        className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${
          lykkehjulMode === "straff"
            ? fullscreen
              ? "bg-white/20 text-white"
              : "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
            : fullscreen
              ? "text-white/60 hover:text-white"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        Straffe hjul
      </button>
      <button
        onClick={() => setLykkehjulMode("person")}
        className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${
          lykkehjulMode === "person"
            ? fullscreen
              ? "bg-white/20 text-white"
              : "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
            : fullscreen
              ? "text-white/60 hover:text-white"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        Person hjul
      </button>
    </div>
  )

  const wheelContent = mode === "casino" ? (
    <CasinoRoulette members={members} groupData={groupData} onApplyPunishments={handleApplyPunishments} fullscreen={fullscreen} />
  ) : lykkehjulMode === "straff" ? (
    <CustomWheel
      segments={segments.length > 0 ? segments : undefined}
      onEditSegments={() => setShowEditor(true)}
      members={members}
      groupData={groupData}
      onApplyPunishment={handleApplySinglePunishment}
      fullscreen={fullscreen}
    />
  ) : (
    <PersonWheel
      members={members}
      groupData={groupData}
      onApplyPunishment={handleApplySinglePunishment}
      fullscreen={fullscreen}
    />
  )

  return (
    <>
      <div className={fullscreen ? "h-full" : "flex flex-col gap-y-3"}>
        {fullscreen ? (
          // In fullscreen mode, wheel components handle their own layout
          // We just need to add mode switchers at the top
          <div className="h-full flex flex-col">
            <div className="flex gap-4 mb-4">
              {modeSwitcher}
              {lykkehjulSubModeSwitcher}
            </div>
            <div className="flex-1">
              {wheelContent}
            </div>
          </div>
        ) : (
          <>
            {modeSwitcher}
            {lykkehjulSubModeSwitcher}
            {wheelContent}
          </>
        )}
      </div>

      {/* Segment Editor Modal */}
      <SegmentEditorModal
        open={showEditor}
        setOpen={setShowEditor}
        segments={segments.length > 0 ? segments : DEFAULT_SEGMENTS}
        onSave={setSegments}
        punishmentTypes={punishmentTypes}
      />
    </>
  )
}

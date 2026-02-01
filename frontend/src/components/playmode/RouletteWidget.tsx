import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { CasinoRoulette } from "./CasinoRoulette"
import { CustomWheel, WheelSegment, generateDefaultSegments } from "./CustomWheel"
import { PersonWheel } from "./PersonWheel"
import { SegmentEditorModal } from "./SegmentEditorModal"
import { Group, GroupUser, PunishmentCreate } from "../../helpers/types"
import { PlayerResult, PunishmentTypeInfo } from "../../helpers/context/playModeContext"
import { useNotification } from "../../helpers/context/notificationContext"

type WheelMode = "casino" | "custom"
type LykkehjulMode = "straff" | "person"

interface RouletteWidgetProps {
  members?: GroupUser[]
  groupData?: Group
}

const BASE_URL = import.meta.env.VITE_BACKEND_URL as string

export const RouletteWidget = ({ members = [], groupData }: RouletteWidgetProps) => {
  const [mode, setMode] = useState<WheelMode>("casino")
  const [lykkehjulMode, setLykkehjulMode] = useState<LykkehjulMode>("straff")
  const [segments, setSegments] = useState<WheelSegment[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const queryClient = useQueryClient()
  const { setNotification } = useNotification()

  // Get punishment types from group data
  const punishmentTypes: PunishmentTypeInfo[] = groupData?.punishment_types
    ? Object.values(groupData.punishment_types).map((pt) => ({
        punishment_type_id: pt.punishment_type_id,
        name: pt.name,
        emoji: pt.emoji,
        value: pt.value,
      }))
    : []

  // Generate default segments when punishment types are available
  useEffect(() => {
    if (punishmentTypes.length > 0 && segments.length === 0) {
      setSegments(generateDefaultSegments(punishmentTypes))
    }
  }, [punishmentTypes, segments.length])

  const handleApplyPunishments = async (losers: PlayerResult[]) => {
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

      // Invalidate queries to refresh the UI
      await queryClient.invalidateQueries({
        queryKey: ["groupLeaderboard", groupData.group_id],
      })
      await queryClient.invalidateQueries({ queryKey: ["leaderboard"] })

      // Build summary of punishments applied
      const summary = losers.reduce((acc, r) => {
        const key = `${r.entry.punishmentType.name} ${r.entry.punishmentType.emoji}`
        acc[key] = (acc[key] || 0) + r.entry.amount
        return acc
      }, {} as Record<string, number>)

      const summaryText = Object.entries(summary)
        .map(([type, count]) => `${count} ${type}`)
        .join(", ")

      setNotification({
        type: "success",
        title: "Straff lagt til",
        text: `${losers.length} ${losers.length === 1 ? "person" : "personer"} fikk straff: ${summaryText}`,
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

  return (
    <div className="flex flex-col gap-y-3">
      {/* Mode Switcher */}
      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
        <button
          onClick={() => setMode("casino")}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            mode === "casino"
              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
        >
          Casino
        </button>
        <button
          onClick={() => setMode("custom")}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            mode === "custom"
              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
        >
          Lykkehjul
        </button>
      </div>

      {/* Lykkehjul Sub-Mode Switcher */}
      {mode === "custom" && (
        <div className="flex rounded-lg bg-gray-50 dark:bg-gray-800 p-0.5">
          <button
            onClick={() => setLykkehjulMode("straff")}
            className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${
              lykkehjulMode === "straff"
                ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Straffe hjul
          </button>
          <button
            onClick={() => setLykkehjulMode("person")}
            className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${
              lykkehjulMode === "person"
                ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Person hjul
          </button>
        </div>
      )}

      {/* Wheel Content */}
      {mode === "casino" ? (
        <CasinoRoulette members={members} groupData={groupData} onApplyPunishments={handleApplyPunishments} />
      ) : lykkehjulMode === "straff" ? (
        <CustomWheel
          segments={segments.length > 0 ? segments : undefined}
          onEditSegments={() => setShowEditor(true)}
          members={members}
          groupData={groupData}
          onApplyPunishment={handleApplySinglePunishment}
        />
      ) : (
        <PersonWheel
          members={members}
          groupData={groupData}
          onApplyPunishment={handleApplySinglePunishment}
        />
      )}

      {/* Segment Editor Modal */}
      <SegmentEditorModal
        open={showEditor}
        setOpen={setShowEditor}
        segments={segments.length > 0 ? segments : generateDefaultSegments(punishmentTypes)}
        onSave={setSegments}
        punishmentTypes={punishmentTypes}
      />
    </div>
  )
}

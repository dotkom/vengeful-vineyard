import { PunishmentReaction } from "../../../helpers/types"
import React from "react"
import { UseMutateFunction } from "@tanstack/react-query"
import { useCurrentUser } from "../../../helpers/context/currentUserContext"

interface ReactionsDisplayProps {
  reactions: PunishmentReaction[]
  mutate: UseMutateFunction<string, unknown, string, unknown>
  removeMutation: UseMutateFunction<string, unknown, void, unknown>
  setSelectedEmoji: React.Dispatch<React.SetStateAction<string>>
}

interface EmojiCounts {
  [key: string]: number
}

export const ReactionsDisplay = ({ reactions, mutate, removeMutation, setSelectedEmoji }: ReactionsDisplayProps) => {
  const { currentUser } = useCurrentUser()

  const emojiCounts = reactions.reduce((acc: EmojiCounts, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
    return acc
  }, {})

  const userReactionEmoji = reactions.find((r) => r.created_by === currentUser.user_id)?.emoji

  return (
    <div className="flex space-x-2">
      {Object.entries(emojiCounts)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([emoji, count]) => (
          <div
            key={emoji}
            className={`flex cursor-pointer items-center justify-center rounded-full border-[1px] px-2 ${
              emoji === userReactionEmoji ? "border-blue-500 bg-blue-100 dark:bg-blue-3" : "border-gray-400 bg-gray-50"
            }`}
            onClick={() => {
              if (emoji === userReactionEmoji) {
                removeMutation()
              } else {
                setSelectedEmoji(emoji)
                mutate(emoji)
              }
            }}
          >
            <span className="text-md">{emoji}</span>
            <span className="ml-1 text-sm text-black dark:text-white">{count}</span>
          </div>
        ))}
    </div>
  )
}

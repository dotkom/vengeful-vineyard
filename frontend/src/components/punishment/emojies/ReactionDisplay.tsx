import { PunishmentReaction } from "../../../helpers/types"
import React from "react"
import { UseMutateFunction } from "@tanstack/react-query"
import { useCurrentUser } from "../../../helpers/context/currentUserContext"
import Tooltip from "../../tooltip/Tooltip"

interface ReactionsDisplayProps {
  reactions: PunishmentReaction[]
  mutate: UseMutateFunction<void, unknown, string, unknown>
  removeMutation: UseMutateFunction<void, unknown, void, unknown>
  setSelectedEmoji: React.Dispatch<React.SetStateAction<string>>
}

interface EmojiCounts {
  [key: string]: string[]
}

export const ReactionsDisplay = ({ reactions, mutate, removeMutation, setSelectedEmoji }: ReactionsDisplayProps) => {
  const { currentUser } = useCurrentUser()

  const emojiReactorNames = reactions.reduce((acc: EmojiCounts, reaction) => {
    acc[reaction.emoji] = [...(acc[reaction.emoji] || []), reaction.created_by_name]
    return acc
  }, {})

  const userReactionEmoji = reactions.find((r) => r.created_by === currentUser.user_id)?.emoji

  return (
    <div className="flex space-x-2">
      {Object.entries(emojiReactorNames)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([emoji, names]) => (
          <div
            key={emoji}
            className={`flex cursor-pointer items-center justify-center rounded-full border-[1px] px-2 group ${
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
            <span className="ml-1 text-sm text-black dark:text-white">{names.length}</span>
            <Tooltip names={names} />
          </div>
        ))}
    </div>
  )
}

import { useContext } from "react";
import { PunishmentReaction } from "../../../../helpers/types";
import { UserContext } from "../../../../helpers/userContext";
import { UseMutateFunction } from "@tanstack/react-query";

interface ReactionsDisplayProps {
  reactions: PunishmentReaction[];
  mutate: UseMutateFunction<string, unknown, string, unknown>;
  removeMutation: UseMutateFunction<string, unknown, void, unknown>;
  setSelectedEmoji: React.Dispatch<React.SetStateAction<string>>;
}

interface EmojiCounts {
  [key: string]: number;
}

export const ReactionsDisplay = ({
  reactions,
  mutate,
  removeMutation,
  setSelectedEmoji,
}: ReactionsDisplayProps) => {
  const { user } = useContext(UserContext);

  const emojiCounts = reactions.reduce((acc: EmojiCounts, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {});

  const userReactionEmoji = reactions.find(
    (r) => r.created_by === user.user_id
  )?.emoji;

  return (
    <div className="absolute bottom-[10px] left-12 flex space-x-2">
      {Object.entries(emojiCounts).map(([emoji, count]) => (
        <div
          key={emoji}
          className={`flex cursor-pointer items-center justify-center rounded-full border-[1px] px-2 ${
            emoji === userReactionEmoji
              ? "border-blue-400 bg-blue-100"
              : "border-blue-400 bg-blue-50"
          }`}
          onClick={() => {
            if (emoji === userReactionEmoji) {
              removeMutation();
            } else {
              setSelectedEmoji(emoji);
              mutate(emoji);
            }
          }}
        >
          <span className="text-md">{emoji}</span>
          <span className="ml-1 text-sm">{count}</span>
        </div>
      ))}
    </div>
  );
};

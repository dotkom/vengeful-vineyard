import { useAuth } from "react-oidc-context";
import { PunishmentReaction } from "../../../../helpers/types";

interface ReactionsDisplayProps {
  reactions: PunishmentReaction[];
}

interface EmojiCounts {
  [key: string]: number;
}

export const ReactionsDisplay = ({ reactions }: ReactionsDisplayProps) => {
  const auth = useAuth();
  const emojiCounts = reactions.reduce((acc: EmojiCounts, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="absolute bottom-[10px] left-12 flex space-x-2">
      {Object.entries(emojiCounts).map(([emoji, count]) => (
        <div
          key={emoji}
          className="flex cursor-pointer items-center justify-center rounded-full border-[1px] border-blue-400 bg-blue-50 px-2"
        >
          <span className="text-md">{emoji}</span>
          <span className="ml-1 text-sm">{count}</span>
        </div>
      ))}
    </div>
  );
};

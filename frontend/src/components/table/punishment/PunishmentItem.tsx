import dayjs from "dayjs";
import { Punishment } from "../../../helpers/types";
import { EmojiPicker } from "./emojies/EmojiPicker";
import { ReactionsDisplay } from "./emojies/ReactionDisplay";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useMutation,
} from "@tanstack/react-query";
import { useState } from "react";
import { getAddReactionUrl } from "../../../helpers/api";
import axios, { AxiosResponse } from "axios";

interface PunishmentItemProps {
  punishment: Punishment;
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>;
}

export const PunishmentItem = ({
  punishment,
  dataRefetch,
}: PunishmentItemProps) => {
  const [selectedEmoji, setSelectedEmoji] = useState("👍");

  const addReactionCall = async () => {
    const ADD_REACTION_URL = getAddReactionUrl(punishment.punishment_id);
    const res: AxiosResponse<string> = await axios.post(ADD_REACTION_URL, {
      emoji: selectedEmoji,
    });
    return res.data;
  };

  const removeReactionCall = async () => {
    const REMOVE_REACTION_URL = getAddReactionUrl(punishment.punishment_id);
    const res: AxiosResponse<string> = await axios.delete(REMOVE_REACTION_URL);
    return res.data;
  };

  const { mutate } = useMutation(addReactionCall, {
    onSuccess: () => dataRefetch(),
    onError: () => console.log("Todo: Handle error"),
  });

  const { mutate: removeMutation } = useMutation(removeReactionCall, {
    onSuccess: () => dataRefetch(),
    onError: () => console.log("Todo: Handle error"),
  });

  const date = dayjs(punishment.created_at);
  const formattedDate = date.format("DD. MMM YY");

  return (
    <div className="relative flex border-b border-l-8 border-l-indigo-600 pb-8 md:border-l-4">
      <div className="text-left font-light">
        <p className="m-4">
          <span className="block">{punishment.reason}</span>
          <span className="block text-gray-500">
            - Gitt av {punishment.created_by}
          </span>
        </p>
      </div>
      <div className="max-w-xs">
        <div className="py-4">
          {Array.from({ length: punishment.amount }, (_, i) => (
            <span key={`${punishment.punishment_id}/${i}`} className="text-xl">
              {punishment.punishment_type_id === 1 && <span>🍺</span>}
              {punishment.punishment_type_id === 2 && <span>🍷</span>}
            </span>
          ))}
        </div>
      </div>
      <div className="text-gray-500' absolute right-8 top-4 font-normal">
        {formattedDate}
      </div>
      <div>
        <EmojiPicker mutate={mutate} setSelectedEmoji={setSelectedEmoji} />
        <ReactionsDisplay
          mutate={mutate}
          removeMutation={removeMutation}
          setSelectedEmoji={setSelectedEmoji}
          reactions={punishment.reactions}
        />
      </div>
    </div>
  );
};

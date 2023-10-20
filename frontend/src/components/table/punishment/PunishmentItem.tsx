import {
  LeaderboardPunishment,
  Punishment,
  PunishmentType,
} from "../../../helpers/types";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useMutation,
} from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";

import { EmojiPicker } from "./emojies/EmojiPicker";
import { ReactionsDisplay } from "./emojies/ReactionDisplay";
import dayjs from "dayjs";
import { getAddReactionUrl } from "../../../helpers/api";
import { useState } from "react";

interface PunishmentItemProps {
  punishment: Punishment | LeaderboardPunishment;
  punishmentTypes: PunishmentType[];
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>;
}

export const PunishmentItem = ({
  punishment,
  punishmentTypes,
  dataRefetch,
}: PunishmentItemProps) => {
  const [selectedEmoji, setSelectedEmoji] = useState("👍");

  const addReactionCall = async (emoji: string) => {
    const ADD_REACTION_URL = getAddReactionUrl(punishment.punishment_id);
    const res: AxiosResponse<string> = await axios.post(ADD_REACTION_URL, {
      emoji,
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

  const isWallOfShame = /wall-of-shame/.test(window.location.href);

  let punishmentType = punishmentTypes.find(
    (type) => type.punishment_type_id === punishment.punishment_type_id
  );

  if (!punishmentType) {
    const innerPunishment = punishment as LeaderboardPunishment;
    punishmentType = innerPunishment.punishment_type;
  }

  return (
    <div
      className={`relative flex border-b border-l-8 border-l-indigo-600 pb-6 md:border-l-4`}
    >
      <div className="text-left font-light">
        <p className="m-4">
          <span className="block">
            {!punishment.reason_hidden ? (
              punishment.reason
            ) : (
              <span className="italic">*Årsak skjult*</span>
            )}
          </span>
          <span className="block text-gray-500">
            - Gitt av {punishment.created_by}
          </span>
        </p>
      </div>
      <div className="max-w-xs">
        <div className="py-4">
          {Array.from({ length: punishment.amount }, (_, i) => (
            <span
              key={`${punishment.punishment_id}/${i}`}
              className="text-xl"
              title={`${punishmentType?.name} (${punishmentType?.value}kr)`}
            >
              {punishmentType?.logo_url}
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

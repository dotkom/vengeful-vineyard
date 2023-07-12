import axios, { AxiosResponse } from "axios";
import { InputForm } from "./InputForm";
import { getAddPunishmentUrl } from "../../../helpers/api";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Leaderboard } from "../../../helpers/types";

interface CreatePunishmentTableRowProps {
  groupId: number;
  userId: number;
  data: Leaderboard;
}

export const CreatePunishmentTableRow = ({
  groupId,
  userId,
  data,
}: CreatePunishmentTableRowProps) => {
  const ADD_PUNISHMENT_URL = getAddPunishmentUrl(groupId, userId);
  const [newPunishment, setNewPunishment] = useState({
    punishment_type_id: 1,
    reason: "",
    reason_hidden: false,
    amount: 0,
  });

  const createPunishmentCall = async () => {
    const res: AxiosResponse<string> = await axios.post(ADD_PUNISHMENT_URL, [
      newPunishment,
    ]);
    return res.data;
  };

  const { mutate } = useMutation(createPunishmentCall, {
    onSuccess: () => {
      console.log("Todo: Handle success");
    },
    onError: () => {
      console.log("Todo: Handle error");
    },
  });

  console.log(newPunishment);

  return (
    <InputForm
      newPunishment={newPunishment}
      setNewPunishment={setNewPunishment}
      submitClickHandler={mutate}
      data={data}
    />
  );
};

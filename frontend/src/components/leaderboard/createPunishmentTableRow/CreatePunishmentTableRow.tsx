import { useMutation } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { useState } from "react";
import { getAddPunishmentUrl } from "../../../helpers/api";
import { Button } from "../../button";
import { AlcoholInput, TextInput } from "../../input";
import { InputForm } from "./InputForm";

interface CreatePunishmentTableRowProps {
  groupId: number;
  userId: number;
}

export const CreatePunishmentTableRow = ({
  groupId,
  userId,
}: CreatePunishmentTableRowProps) => {
  const ADD_PUNISHMENT_URL = getAddPunishmentUrl(groupId, userId);
  const [newPunishment, setNewPunishment] = useState({
    punishment_type_id: 1,
    reason: "",
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

  return (
    <tr className="border-b border-l-8 border-l-indigo-600 md:border-l-4">
      <InputForm
        newPunishment={newPunishment}
        setNewPunishment={setNewPunishment}
        submitClickHandler={mutate}
      />
    </tr>
  );
};

import axios, { AxiosResponse } from "axios";
import { InputForm } from "./InputForm";
import { getAddPunishmentUrl } from "../../../helpers/api";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Leaderboard } from "../../../helpers/types";

interface CreatePunishmentTableRowProps {
  newPunishment: {
    punishment_type_id: number;
    reason: string;
    reason_hidden: boolean;
    amount: number;
  };
  setNewPunishment: React.Dispatch<
    React.SetStateAction<{
      punishment_type_id: number;
      reason: string;
      reason_hidden: boolean;
      amount: number;
    }>
  >;
  data: Leaderboard;
}

export const CreatePunishmentTableRow = ({
  newPunishment,
  setNewPunishment,
  data,
}: CreatePunishmentTableRowProps) => (
  <InputForm
    newPunishment={newPunishment}
    setNewPunishment={setNewPunishment}
    data={data}
  />
);

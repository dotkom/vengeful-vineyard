import { AlcoholInput, TextInput } from "../../input";
import { Button } from "../../button";
import { UseMutateFunction } from "@tanstack/react-query";
import { Select } from "../../select";
import { Leaderboard } from "../../../helpers/types";

interface InputFormProps {
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
  submitClickHandler: UseMutateFunction<string, unknown, void, unknown>;
  data: Leaderboard;
}

export const InputForm = ({
  newPunishment,
  setNewPunishment,
  submitClickHandler,
  data
}: InputFormProps) => {
  const textInputHandler = (evt: React.ChangeEvent<HTMLInputElement>) =>
    setNewPunishment({ ...newPunishment, reason: evt.currentTarget.value });

  const typeInputHandler = (evt: React.ChangeEvent<HTMLSelectElement>) =>
    setNewPunishment({
      ...newPunishment,
      punishment_type_id: Number(evt.currentTarget.value),
    });

  const amountInputHandler = (evt: React.ChangeEvent<HTMLInputElement>) =>
    setNewPunishment({
      ...newPunishment,
      amount: Number(evt.currentTarget.value),
    });

  return (
    <div className="mb-4 flex flex-col gap-2 font-normal">
      <Select data={data} />
      <TextInput
        placeholder="Begrunnelse"
        value={newPunishment.reason}
        changeHandler={textInputHandler}
      />
      <AlcoholInput
        type={newPunishment.punishment_type_id}
        amount={newPunishment.amount}
        typeInputHandler={typeInputHandler}
        amountInputHandler={amountInputHandler}
      />
    </div>
  );
};

import { AlcoholInput, TextInput } from "../../input";

import { Button } from "../../button";
import { UseMutateFunction } from "@tanstack/react-query";

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
}

export const InputForm = ({
  newPunishment,
  setNewPunishment,
  submitClickHandler,
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
    <td className="mb-4 flex max-w-xs flex-col gap-2 px-4 pt-4 font-normal">
      <div className="text-left">
        <TextInput
          label="Ny straff"
          placeholder="Begrunnelse"
          value={newPunishment.reason}
          changeHandler={textInputHandler}
        />
      </div>
      <div className="flex gap-2 text-left">
        <AlcoholInput
          type={newPunishment.punishment_type_id}
          amount={newPunishment.amount}
          typeInputHandler={typeInputHandler}
          amountInputHandler={amountInputHandler}
        />
        <div>
          <Button label="Straff" clickHandler={submitClickHandler} />
        </div>
      </div>
    </td>
  );
};

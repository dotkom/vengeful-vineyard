import { Group, GroupUser } from "../../../../helpers/types";

import { AlcoholInput } from "./AlcoholInput";
import { PersonSelect } from "./PersonSelect";
import { ReasonHiddenInput } from "./ReasonHiddenInput";
import { ReasonInput } from "./ReasonInput";

interface ModalInputProps {
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
  data: Group;
  selectedPerson: GroupUser;
  setSelectedPerson: React.Dispatch<React.SetStateAction<GroupUser>>;
}

export const ModalInput = ({
  newPunishment,
  setNewPunishment,
  data,
  selectedPerson,
  setSelectedPerson,
}: ModalInputProps) => {
  const textInputHandler = (evt: React.ChangeEvent<HTMLInputElement>) =>
    setNewPunishment({ ...newPunishment, reason: evt.currentTarget.value });

  const reasonHiddenChangeHandler = (
    evt: React.ChangeEvent<HTMLInputElement>
  ) =>
    setNewPunishment({
      ...newPunishment,
      reason_hidden: evt.currentTarget.checked,
    });

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
      <PersonSelect
        data={data}
        selectedPerson={selectedPerson}
        setSelectedPerson={setSelectedPerson}
      />
      <ReasonInput
        placeholder="Begrunnelse"
        textValue={newPunishment.reason}
        textChangeHandler={textInputHandler}
      />
      <ReasonHiddenInput
        reasonHiddenValue={newPunishment.reason_hidden}
        reasonHiddenChangeHandler={reasonHiddenChangeHandler}
      />
      <AlcoholInput
        type={newPunishment.punishment_type_id}
        amount={newPunishment.amount}
        data={data}
        typeInputHandler={typeInputHandler}
        amountInputHandler={amountInputHandler}
      />
    </div>
  );
};

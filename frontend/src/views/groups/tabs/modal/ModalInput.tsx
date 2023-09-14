import { Group, GroupUser } from "../../../../helpers/types";
import { Select } from "../../../../components/select";
import { TextInput } from "./TextInput";
import { AlcoholInput } from "./AlcoholInput";

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
      <Select
        data={data}
        selectedPerson={selectedPerson}
        setSelectedPerson={setSelectedPerson}
      />
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

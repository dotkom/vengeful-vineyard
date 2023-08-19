import { InputForm } from "./InputForm";
import { Group, GroupUser } from "../../../helpers/types";

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
  data: Group;
  selectedPerson: GroupUser;
  setSelectedPerson: React.Dispatch<React.SetStateAction<GroupUser>>;
}

export const CreatePunishmentTableRow = ({
  newPunishment,
  setNewPunishment,
  data,
  selectedPerson,
  setSelectedPerson,
}: CreatePunishmentTableRowProps) => (
  <InputForm
    newPunishment={newPunishment}
    setNewPunishment={setNewPunishment}
    data={data}
    selectedPerson={selectedPerson}
    setSelectedPerson={setSelectedPerson}
  />
);

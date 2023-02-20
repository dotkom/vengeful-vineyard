import { useMutation } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { useState } from "react";
import { getAddPunishmentUrl } from "../../helpers/api";
import { Button } from "../button";

interface CreatePunishmentFormProps {
  groupId: number;
  userId: number;
}

export const CreatePunishmentForm = ({
  groupId,
  userId,
}: CreatePunishmentFormProps) => {
  const [newPunishment, setNewPunishment] = useState({
    punishment_type_id: 1,
    reason: "",
    amount: 0,
  });

  const ADD_PUNISHMENT_URL = getAddPunishmentUrl(groupId, userId);

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

  const handleCreateClick = () => {
    mutate();
  };

  return (
    <tr className="border-b border-l-8 md:border-l-4 border-l-lime-800">
      <th className="flex flex-col font-normal px-4 pt-4">
        <input
          type="text"
          placeholder="Begrunnelse for staff"
          className="p-2 border rounded"
          value={newPunishment.reason}
          onChange={(evt) =>
            setNewPunishment({
              ...newPunishment,
              reason: evt.currentTarget.value,
            })
          }
        />
        <div className="flex gap-2">
          <select
            className="p-2 border rounded my-4 w-12 bg-white"
            value={newPunishment.punishment_type_id}
            onChange={(evt) =>
              setNewPunishment({
                ...newPunishment,
                punishment_type_id: Number(evt.currentTarget.value),
              })
            }
          >
            <option value="1">🍺</option>
            <option value="2">🍷</option>
          </select>
          <input
            type="number"
            placeholder="0"
            className="p-2 border rounded my-4 w-20"
            value={newPunishment.amount}
            onChange={(evt) =>
              setNewPunishment({
                ...newPunishment,
                amount: Number(evt.currentTarget.value),
              })
            }
          />
          <div className="py-4 w-full">
            <Button label="+" clickHandler={handleCreateClick} />
          </div>
        </div>
      </th>
      <th className="bg-[url('https://mir-s3-cdn-cf.behance.net/project_modules/1400/6c9df071379043.5bc3ae398a894.gif')] bg-no-repeat bg-cover bg-center" />
    </tr>
  );
};

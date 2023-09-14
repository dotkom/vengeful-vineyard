import React, { forwardRef, Fragment, useContext, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { SunIcon } from "@radix-ui/react-icons";
import { CreatePunishmentTableRow } from "../leaderboard/createPunishmentTableRow";
import { getAddPunishmentUrl, getGroupLeaderboardUrl } from "../../helpers/api";
import axios, { AxiosResponse } from "axios";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { Group, GroupUser } from "../../helpers/types";
import { NotificationContext } from "../../helpers/notificationContet";

interface ModalProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedGroup: Group;
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Group, unknown>>;
}

export const Modal = forwardRef(
  ({ setOpen, selectedGroup, dataRefetch }: ModalProps, ref) => {
    const [selectedPerson, setSelectedPerson] = useState<GroupUser | undefined>(
      undefined
    );
    const [newPunishment, setNewPunishment] = useState({
      punishment_type_id: 1,
      reason: "",
      reason_hidden: false,
      amount: 1,
    });
    const { setNotification } = useContext(NotificationContext);

    const { isLoading, error, data } = useQuery({
      queryKey: ["groupLeaderboard"],
      queryFn: () =>
        axios
          .get(getGroupLeaderboardUrl(selectedGroup.group_id))
          .then((res: AxiosResponse<Group>) => {
            setSelectedPerson(res.data.members[0]);
            setNewPunishment((prev) => ({
              ...prev,
              punishment_type_id:
                res.data.punishment_types[0].punishment_type_id,
            }));
            return res.data;
          }),
    });

    const createPunishmentCall = async () => {
      if (selectedPerson) {
        const ADD_PUNISHMENT_URL = getAddPunishmentUrl(
          selectedGroup.group_id,
          selectedPerson.user_id
        );
        const res: AxiosResponse<string> = await axios.post(
          ADD_PUNISHMENT_URL,
          [newPunishment]
        );
        return res.data;
      } else {
        console.log("......");
      }
    };

    const { mutate } = useMutation(createPunishmentCall, {
      onSuccess: () => {
        dataRefetch();
        setNotification({
          show: true,
          title: "Straff registrert!",
          text: `Du ga en straff til ${selectedPerson?.first_name}`,
        });
      },
      onError: () => {
        console.log("Todo: Handle error");
      },
    });

    if (data)
      return (
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={ref}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-100"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-100"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                        <SunIcon
                          className="h-6 w-6 text-blue-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          Gi straff
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Her kan du lage en ny vinstraff
                          </p>
                          <CreatePunishmentTableRow
                            newPunishment={newPunishment}
                            setNewPunishment={setNewPunishment}
                            data={data}
                            selectedPerson={selectedPerson}
                            setSelectedPerson={setSelectedPerson}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                      onClick={() => {
                        mutate();
                        setOpen(false);
                      }}
                    >
                      Gi straff
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setOpen(false)}
                      ref={ref}
                    >
                      Avbryt
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      );

    return <h1>loading</h1>;
  }
);

import { Fragment, useState } from "react";
import { FaceSmileIcon } from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { Group, Punishment } from "../../../../helpers/types";
import { getAddReactionUrl } from "../../../../helpers/api";
import axios, { AxiosResponse } from "axios";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useMutation,
} from "@tanstack/react-query";

interface EmojiPickerProps {
  punishment: Punishment;
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Group, unknown>>;
}

export const EmojiPicker = ({ punishment, dataRefetch }: EmojiPickerProps) => {
  const [selectedEmoji, setSelectedEmoji] = useState("👍");
  const emojis = ["👍", "👎", "😂", "❤️", "🔥", "🚀"];

  const addReactionCall = async () => {
    const ADD_REACTION_URL = getAddReactionUrl(punishment.punishment_id);
    const res: AxiosResponse<string> = await axios.post(ADD_REACTION_URL, {
      emoji: selectedEmoji,
    });
    return res.data;
  };

  const { mutate } = useMutation(addReactionCall, {
    onSuccess: () => {
      dataRefetch();
    },
    onError: () => {
      console.log("Todo: Handle error");
    },
  });

  return (
    <div className="absolute -bottom-1 left-0">
      <Menu as="div" className="relative inline-block text-left">
        {({ open }) => (
          <>
            <Menu.Button className="absolute bottom-2 left-4 cursor-pointer rounded-full border-[1px] border-gray-400 bg-gray-100 p-[2px] hover:bg-gray-200">
              <FaceSmileIcon className="h-5 w-5 text-gray-700" />
            </Menu.Button>
            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                static
                className="absolute bottom-10 left-4 rounded border-[1px]  bg-white text-2xl shadow-md"
              >
                <div className="flex">
                  {emojis.map((emoji, index) => (
                    <Menu.Item key={index}>
                      {({ active }) => (
                        <span
                          className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded ${
                            active ? "bg-gray-100" : ""
                          }`}
                          onClick={() => {
                            setSelectedEmoji(emoji);
                            mutate();
                          }}
                        >
                          {emoji}
                        </span>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
};

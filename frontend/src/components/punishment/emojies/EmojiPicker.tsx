import { Menu, Transition } from "@headlessui/react"
import React, { Fragment } from "react"

import { FaceSmileIcon } from "@heroicons/react/24/outline"
import { UseMutateFunction } from "@tanstack/react-query"

interface EmojiPickerProps {
  mutate: UseMutateFunction<string, unknown, string, unknown>
  setSelectedEmoji: React.Dispatch<React.SetStateAction<string>>
}

export const EmojiPicker = ({ mutate, setSelectedEmoji }: EmojiPickerProps) => {
  const emojis = ["👍", "👎", "😂", "❤️", "🔥", "🚀", "😬", "😭", "💀"]

  return (
    <Menu as="div" className="relative flex items-center text-left">
      {({ open }) => (
        <>
          <Menu.Button className="cursor-pointer rounded-full border-[1px] border-gray-400 bg-gray-100 p-[2px] hover:bg-gray-200">
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
            <Menu.Items static className="absolute bottom-9 rounded border-[1px]  bg-white text-2xl shadow-md">
              <div className="flex">
                {emojis.map((emoji, index) => (
                  <Menu.Item key={index}>
                    {({ active }) => (
                      <span
                        className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded ${
                          active ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          setSelectedEmoji(emoji)
                          mutate(emoji)
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
  )
}

import React, { Fragment } from "react"
import { Listbox, Transition } from "@headlessui/react"
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid"
import { classNames } from "../../../../helpers/classNames"
import { Group, GroupUser } from "../../../../helpers/types"
import { textToEmoji } from "../../../../helpers/emojies"

interface PersonSelectProps {
  data: Group
  selectedPerson: GroupUser
  setSelectedPerson: React.Dispatch<React.SetStateAction<GroupUser>>
}

export const PersonSelect = ({ data, selectedPerson, setSelectedPerson }: PersonSelectProps) => {
  if (selectedPerson)
    return (
      <Listbox value={selectedPerson} onChange={setSelectedPerson}>
        {({ open }) => (
          <>
            <div className="relative mt-2">
              <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                <span className="flex items-center">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full align-middle text-xl">
                    {textToEmoji(selectedPerson.first_name + selectedPerson.last_name)}
                  </span>
                  <span className="ml-3 block truncate">
                    {selectedPerson.first_name} {selectedPerson.last_name}
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {data.members.map((person) => (
                    <Listbox.Option
                      key={person.ow_user_id}
                      className={({ active }) =>
                        classNames(
                          active ? "bg-indigo-600 text-white" : "text-gray-900",
                          "relative cursor-default select-none py-2 pl-3 pr-9"
                        )
                      }
                      value={person}
                    >
                      {({ selected, active }) => (
                        <>
                          <div className="flex items-center">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full  align-middle text-xl">
                              {textToEmoji(person.first_name + person.last_name)}
                            </span>
                            <span
                              className={classNames(selected ? "font-semibold" : "font-normal", "ml-3 block truncate")}
                            >
                              {person.first_name} {person.last_name}
                            </span>
                          </div>

                          {selected ? (
                            <span
                              className={classNames(
                                active ? "text-white" : "text-indigo-600",
                                "absolute inset-y-0 right-0 flex items-center pr-4"
                              )}
                            >
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    )
  return <h1>loading</h1>
}

import { Dispatch, Fragment, SetStateAction } from "react"
import { Listbox as HeadlessUiListbox, Transition } from "@headlessui/react"

import { CheckIcon } from "@radix-ui/react-icons"
import { ChevronUpDownIcon } from "@heroicons/react/24/outline"
import { classNames } from "../../helpers/classNames"

export interface ListboxOption<T = unknown> {
  value: T
  label: string
}

interface ListboxProps<T = unknown> {
  value: T
  onChange?: Dispatch<SetStateAction<T>>
  options: ListboxOption<T>[]
}

export const Listbox = <T,>({ value, onChange, options }: ListboxProps<T>) => {
  return (
    <HeadlessUiListbox value={value} onChange={onChange}>
      {({ open }) => (
        <>
          <div className="relative">
            <HeadlessUiListbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
              <span className="block truncate">{options.find((option) => option.value === value)?.label}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </HeadlessUiListbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <HeadlessUiListbox.Options className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options.map((option) => (
                  <HeadlessUiListbox.Option
                    key={String(option.value)}
                    value={option.value}
                    className={({ active }) =>
                      classNames(
                        active ? "bg-gray-900/5" : "text-gray-900",
                        "relative cursor-default select-none py-2 pr-9"
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span className={classNames("font-normal", "ml-3 block truncate")}>{option.label}</span>
                        {selected ? (
                          <span
                            className={classNames(
                              "text-indigo-600",
                              "absolute inset-y-0 right-0 flex items-center pr-4"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </HeadlessUiListbox.Option>
                ))}
              </HeadlessUiListbox.Options>
            </Transition>
          </div>
        </>
      )}
    </HeadlessUiListbox>
  )
}
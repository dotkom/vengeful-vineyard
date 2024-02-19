import { Fragment } from "react"
import { Listbox as HeadlessUiListbox, Transition } from "@headlessui/react"

import { CheckIcon } from "@radix-ui/react-icons"
import { ChevronUpDownIcon } from "@heroicons/react/24/outline"
import { classNames } from "../../helpers/classNames"

export interface ListboxOption<T = unknown> {
  value: T
  label: string
  disabled?: boolean
}

interface ListboxProps<T = unknown> {
  label?: string
  value: T
  onChange?: (value: T) => void
  options: ListboxOption<T>[]
}

export const Listbox = <T,>({ label, value, onChange, options }: ListboxProps<T>) => {
  return (
    <HeadlessUiListbox value={value} onChange={onChange}>
      {({ open }) => (
        <>
          <div className="relative flex flex-col gap-y-1">
            {label && <span className="font-bold text-sm ml-1 text-gray-700">{label}</span>}
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
              <HeadlessUiListbox.Options
                className={classNames(
                  "absolute z-20 max-h-56 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm",
                  label ? "mt-16" : "mt-10"
                )}
              >
                {options.map((option) => (
                  <HeadlessUiListbox.Option
                    key={String(option.value)}
                    value={option.value}
                    disabled={option.disabled ?? false}
                    className={({ active, disabled }) =>
                      classNames(
                        disabled ? "text-gray-500" : active ? "bg-gray-900/5" : "text-gray-900",
                        "relative cursor-pointer select-none py-2 pr-9 hover:text-gray-500"
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

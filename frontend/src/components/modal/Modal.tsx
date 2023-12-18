import { Dialog, Transition } from "@headlessui/react"
import React, { Fragment, forwardRef } from "react"

import { SunIcon } from "@radix-ui/react-icons"

interface ModalProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  includePrimaryButton?: boolean
  isLoading?: boolean
  primaryButtonLabel?: string
  includeCancelButton?: boolean
  cancelButtonLabel?: string
  title?: string
  children?: React.ReactNode
  primaryButtonAction?: () => boolean
  cancelButtonAction?: () => void
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      setOpen,
      title,
      children,
      includePrimaryButton = true,
      primaryButtonLabel = "Gjør",
      includeCancelButton = true,
      cancelButtonLabel = "Cancel",
      primaryButtonAction,
      cancelButtonAction,
    },
    ref
  ) => {
    return (
      <Dialog as="div" className="relative z-10" onClose={() => setOpen(false)} ref={ref}>
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
                      <SunIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      {title && (
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                          {title}
                        </Dialog.Title>
                      )}
                      {children}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  {includePrimaryButton && (
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                      onClick={() => {
                        let result: boolean | undefined = true
                        if (primaryButtonAction) {
                          result = primaryButtonAction()
                        }

                        if (result) {
                          setOpen(false)
                        }
                      }}
                    >
                      {primaryButtonLabel}
                    </button>
                  )}
                  {includeCancelButton && (
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => {
                        setOpen(false)

                        if (cancelButtonAction) {
                          cancelButtonAction()
                        }
                      }}
                    >
                      {cancelButtonLabel}
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    )
  }
)

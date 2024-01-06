import { Dialog, Transition } from "@headlessui/react"
import { ExclamationCircleIcon, SunIcon } from "@heroicons/react/24/outline"
import React, { ForwardRefExoticComponent, Fragment, SVGProps, forwardRef } from "react"

import { Button } from "../button"
import ReactMarkdown from "react-markdown"
import { classNames } from "../../helpers/classNames"

interface ModalProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  includePrimaryButton?: boolean
  isLoading?: boolean
  primaryButtonLabel?: string
  includeCancelButton?: boolean
  primaryButtonDisabled?: boolean
  cancelButtonLabel?: string
  title?: string
  description?: string
  type?: "REGULAR" | "ERROR" | "WARNING"
  icon?: ForwardRefExoticComponent<
    SVGProps<SVGSVGElement> & {
      title?: string | undefined
      titleId?: string | undefined
    }
  >
  children?: React.ReactNode
  primaryButtonAction?: () => boolean
  cancelButtonAction?: () => void
  onClose?: () => void
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      setOpen,
      title,
      description,
      children,
      type = "REGULAR",
      icon,
      includePrimaryButton = true,
      primaryButtonLabel = "Gjennomfør",
      primaryButtonDisabled = false,
      includeCancelButton = true,
      cancelButtonLabel = "Lukk",
      primaryButtonAction,
      cancelButtonAction,
      onClose,
    },
    ref
  ) => {
    let Icon
    let iconColorClass

    switch (type) {
      case "ERROR":
        Icon = ExclamationCircleIcon
        iconColorClass = "text-red-600 bg-red-100"
        break
      case "WARNING":
        Icon = ExclamationCircleIcon
        iconColorClass = "text-yellow-600 bg-yellow-100"
        break
      default:
        Icon = SunIcon
        iconColorClass = "text-blue-600 bg-blue-100"
        break
    }

    if (icon) {
      Icon = icon
    }

    return (
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          if (onClose) onClose()
          setOpen(false)
        }}
        ref={ref}
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
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform bg-gray-50 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="flex items-start gap-x-2">
                    <div
                      className={classNames(
                        "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-10 sm:w-10",
                        iconColorClass
                      )}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className={`${description ? "" : "mt-3"} sm:ml-2 sm:mt-0 sm:text-left`}>
                      {title && (
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                          {title}
                        </Dialog.Title>
                      )}
                      {description && <ReactMarkdown className="text-sm text-gray-500">{description}</ReactMarkdown>}
                    </div>
                  </div>
                  {children}
                </div>
                <div className="w-full flex flex-row gap-x-1 items-center justify-end px-4 pb-4">
                  {includeCancelButton && (
                    <Button
                      label={cancelButtonLabel}
                      variant="OUTLINE"
                      className="min-w-[4rem] flex justify-center items-center"
                      onClick={() => {
                        setOpen(false)

                        if (cancelButtonAction) {
                          cancelButtonAction()
                        }
                      }}
                    />
                  )}
                  {includePrimaryButton && (
                    <Button
                      label={primaryButtonLabel}
                      disabled={primaryButtonDisabled}
                      className="min-w-[4rem] flex justify-center items-center"
                      onClick={() => {
                        let result: boolean | undefined = true
                        if (primaryButtonAction) {
                          result = primaryButtonAction()
                        }

                        if (result) {
                          setOpen(false)
                        }
                      }}
                    />
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

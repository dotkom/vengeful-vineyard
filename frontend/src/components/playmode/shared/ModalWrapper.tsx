import { Fragment, ReactNode } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"

interface ModalWrapperProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  subtitle?: string
  maxWidth?: "sm" | "md" | "lg"
  headerClassName?: string
  panelClassName?: string
  showCloseButton?: boolean
  header?: ReactNode
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
}

export const ModalWrapper = ({
  open,
  onClose,
  children,
  title,
  subtitle,
  maxWidth = "md",
  headerClassName = "",
  panelClassName = "",
  showCloseButton = true,
  header,
}: ModalWrapperProps) => {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`relative w-full ${maxWidthClasses[maxWidth]} transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all ${panelClassName}`}
              >
                {header ? (
                  header
                ) : title ? (
                  <div className={`flex items-center justify-between p-6 pb-0 ${headerClassName}`}>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                      </Dialog.Title>
                      {subtitle && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
                      )}
                    </div>
                    {showCloseButton && (
                      <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ) : null}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { ArrowsPointingInIcon } from "@heroicons/react/24/outline"
import { RouletteWidget } from "./RouletteWidget"
import { usePlayMode } from "../../helpers/context/playModeContext"
import { Group, GroupUser } from "../../helpers/types"

interface FullscreenPlayModeProps {
  members?: GroupUser[]
  groupData?: Group
}

export const FullscreenPlayMode = ({ members = [], groupData }: FullscreenPlayModeProps) => {
  const { isFullscreen, setIsFullscreen } = usePlayMode()

  return (
    <Transition.Root show={isFullscreen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setIsFullscreen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="h-full w-full">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10">
                <Dialog.Title className="text-2xl font-bold text-white">
                  Lekemodus
                </Dialog.Title>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                >
                  <ArrowsPointingInIcon className="h-5 w-5" />
                  Minimer
                </button>
              </div>

              {/* Content */}
              <div className="h-full pt-16 pb-4 px-4">
                <RouletteWidget members={members} groupData={groupData} fullscreen />
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

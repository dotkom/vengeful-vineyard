import {
  ComputerDesktopIcon,
  MoonIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "../../helpers/classNames";
import { Modal } from "../modal/Modal";
import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const tabs = [
  { name: "Dotkom", href: "#", icon: ComputerDesktopIcon, current: true },
  { name: "Prekom", href: "#", icon: MoonIcon, current: false },
];

export const Tabs = () => {
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);

  return (
    <Fragment>
      <Transition.Root show={open} as={Fragment}>
        <Modal setOpen={setOpen} ref={cancelButtonRef} />
      </Transition.Root>

      <div className="mx-4 max-w-5xl md:m-auto md:px-8">
        <div className="sm:block">
          <div>
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <a
                  key={tab.name}
                  href={tab.href}
                  className={classNames(
                    tab.current
                      ? "border-white text-white"
                      : "border-transparent text-gray-200 hover:border-gray-100 hover:text-gray-100",
                    "group inline-flex items-center border-b-4 py-2 px-1 text-sm font-medium"
                  )}
                  aria-current={tab.current ? "page" : undefined}
                >
                  <tab.icon
                    className={classNames(
                      tab.current
                        ? "text-white"
                        : "text-gray-200 group-hover:text-gray-100",
                      "-ml-0.5 mr-2 h-5 w-5"
                    )}
                    aria-hidden="true"
                  />
                  <span>{tab.name}</span>
                </a>
              ))}
              <div className="w-full">
                <button
                  type="button"
                  className="relative inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 float-right"
                  onClick={() => setOpen(true)}
                >
                  <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                  Ny straff
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

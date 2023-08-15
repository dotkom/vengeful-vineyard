import { ComputerDesktopIcon, PlusIcon } from "@heroicons/react/24/outline";
import { classNames } from "../../helpers/classNames";
import { Modal } from "../modal/Modal";
import { Fragment, useEffect, useRef, useState } from "react";
import { Transition } from "@headlessui/react";
import { Group } from "../../helpers/types";

interface TabsProps {
  selectedGroup: Group | undefined;
  setSelectedGroup: React.Dispatch<React.SetStateAction<Group | undefined>>;
  groups?: Group[];
}

export const Tabs = ({
  selectedGroup,
  setSelectedGroup,
  groups,
}: TabsProps) => {
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (selectedGroup === undefined && groups) setSelectedGroup(groups[0]);
  }, [groups]);

  return (
    <Fragment>
      <Transition.Root show={open} as={Fragment}>
        <Modal setOpen={setOpen} ref={cancelButtonRef} />
      </Transition.Root>

      <div className="mx-4 max-w-5xl md:m-auto md:px-8">
        <div className="sm:block">
          <div>
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {groups !== undefined ? (
                <>
                  {groups.map((group) => (
                    <a
                      key={group.name_short}
                      className={classNames(
                        group.group_id === selectedGroup?.group_id
                          ? "border-black text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-500 hover:text-gray-900",
                        "group inline-flex cursor-pointer items-center border-b-4 px-1 py-2 text-sm font-medium"
                      )}
                      aria-current={group.group_id ? "page" : undefined}
                    >
                      <ComputerDesktopIcon
                        className={classNames(
                          group.group_id === selectedGroup?.group_id
                            ? "text-gray-900"
                            : "text-gray-500 group-hover:text-gray-900",
                          "-ml-0.5 mr-2 h-5 w-5"
                        )}
                        aria-hidden="true"
                      />
                      <span>{group.name_short}</span>
                    </a>
                  ))}
                </>
              ) : (
                <>
                  <span className="mx-1 my-2 h-6 w-20 animate-pulse rounded-full bg-slate-300 text-sm" />
                </>
              )}

              <div className="w-full">
                <button
                  type="button"
                  className="relative float-right inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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

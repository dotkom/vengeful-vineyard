import { PlusIcon } from "@heroicons/react/24/outline";
import { Modal } from "../modal/Modal";
import { Fragment, useEffect, useRef, useState } from "react";
import { Transition } from "@headlessui/react";
import { Group } from "../../helpers/types";
import { TabItem } from "./TabItem";
import { SkeletonTabItem } from "./SkeletonTabItem";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "@tanstack/react-query";

interface TabsProps {
  selectedGroup: Group | undefined;
  setSelectedGroup: React.Dispatch<React.SetStateAction<Group | undefined>>;
  groups?: Group[];
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Group, unknown>>;
}

export const Tabs = ({
  selectedGroup,
  setSelectedGroup,
  groups,
  dataRefetch,
}: TabsProps) => {
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (selectedGroup === undefined && groups) setSelectedGroup(groups[0]);
  }, [groups]);

  return (
    <Fragment>
      <Transition.Root show={open} as={Fragment}>
        <Modal
          setOpen={setOpen}
          ref={cancelButtonRef}
          selectedGroup={selectedGroup}
          dataRefetch={dataRefetch}
        />
      </Transition.Root>

      <div className="mx-4 max-w-5xl md:m-auto md:px-8">
        <div className="sm:block">
          <div>
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {groups !== undefined ? (
                <>
                  {groups.map((group) => (
                    <TabItem
                      key={group.group_id}
                      group={group}
                      selectedGroup={selectedGroup}
                    />
                  ))}
                  <div className="w-full">
                    <button
                      type="button"
                      className="relative float-right inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      onClick={() => setOpen(true)}
                    >
                      <PlusIcon
                        className="-ml-0.5 h-5 w-5"
                        aria-hidden="true"
                      />
                      Ny straff
                    </button>
                  </div>
                </>
              ) : (
                <SkeletonTabItem />
              )}
            </nav>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

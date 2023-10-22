import {PencilIcon, TrashIcon} from "@heroicons/react/24/solid";
import {PlusIcon} from "@heroicons/react/24/outline";
import {PunishmentType} from "../../helpers/types";

export const PunishmentsEditor = ({ groupData, isLoading, dataRefetch }) => {
    return (
        <div className="mt-8 mx-4 max-w-5xl md:px-8 grid gap-4 grid-cols-4">
            {
                groupData?.punishment_types.map((punishmentType: PunishmentType) => (
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4 flex flex-col items-center justify-between">
                        <input
                            type="text"
                            defaultValue={punishmentType.name}
                            className="mb-4 text-xl text-center w-full border-gray-200 rounded-md p-2 shadow-sm cursor-not-allowed"
                            onFocus={(e) => e.target.select()}
                            disabled
                        />
                        <div className="text-9xl mb-4">
                            {punishmentType.logo_url}
                        </div>
                        <input
                            type="number"
                            defaultValue={punishmentType.value}
                            className="text-center w-full border-gray-200 rounded-md p-2 shadow-sm cursor-not-allowed"
                            disabled
                        />
                    </div>
                ))
            }
            {
                /*
            <div className="bg-gray-200 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4 flex items-center justify-center">
                <PlusIcon fontSize={48} />
            </div>
                 */
            }
        </div>
    );
}

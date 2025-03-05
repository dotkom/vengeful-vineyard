import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { type Dispatch, Fragment, type SetStateAction, useState } from "react";
import type { GroupUser } from "../../helpers/types";

import { cn } from "../../helpers/classNames";
import { textToEmoji } from "../../helpers/emojies";

interface PersonSelectProps {
	label?: string;
	members: GroupUser[];
	selectedPerson: GroupUser | undefined;
	setSelectedPerson: Dispatch<SetStateAction<GroupUser | undefined>>;
}

export const PersonSelect = ({
	label,
	members,
	selectedPerson,
	setSelectedPerson,
}: PersonSelectProps) => {
	const [query, setQuery] = useState("");

	const filteredMembers = members.filter((member) => {
		const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
		return fullName.includes(query.toLowerCase());
	});

	if (selectedPerson)
		return (
			<Combobox value={selectedPerson} onChange={setSelectedPerson}>
				{({ activeOption }) => (
					<div className="relative flex flex-col gap-y-1">
						{label && (
							<span className="font-bold text-sm ml-1 text-gray-700">
								{label}
							</span>
						)}
						<div
							className={cn(
								"relative w-full cursor-default rounded-md py-[0.174rem] pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6",
								activeOption || filteredMembers.length === 0
									? "pl-0.5"
									: "pl-6",
							)}
						>
							{query === "" && !activeOption && (
								<span className="absolute flex items-center h-full top-0 left-2 text-base">
									{textToEmoji(
										selectedPerson.first_name + selectedPerson.last_name,
									)}
								</span>
							)}
							<Combobox.Input
								className="w-full border-none text-sm leading-5 text-gray-900 focus:ring-0 h-full bg-white"
								displayValue={(person: GroupUser) =>
									`${person.first_name} ${person.last_name}`
								}
								onChange={(event) => setQuery(event.target.value)}
							/>
							<Combobox.Button className="absolute inset-y-0 right-0 flex items-center justify-end pr-2 w-12">
								<ChevronUpDownIcon
									className="h-5 w-5 text-gray-400"
									aria-hidden="true"
								/>
							</Combobox.Button>
						</div>

						<Transition
							as={Fragment}
							leave="transition ease-in duration-100"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
							afterLeave={() => setQuery("")}
						>
							<Combobox.Options
								className={`${
									label ? "top-16" : "top-10"
								} absolute z-20 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm`}
							>
								{filteredMembers.map((person) => (
									<Combobox.Option
										key={person.ow_user_id}
										className={({ active }) =>
											cn(
												active ? "bg-indigo-600 text-white" : "text-gray-900",
												"relative cursor-default select-none py-2 pl-3 pr-9",
											)
										}
										value={person}
									>
										{({ selected, active }) => (
											<>
												<div className="flex items-center">
													<span className="flex h-5 w-5 items-center justify-center rounded-full  align-middle text-xl">
														{textToEmoji(person.first_name + person.last_name)}
													</span>
													<span
														className={cn(
															selected ? "font-semibold" : "font-normal",
															"ml-3 block truncate",
														)}
													>
														{person.first_name} {person.last_name}
													</span>
												</div>

												{selected ? (
													<span
														className={cn(
															active ? "text-white" : "text-indigo-600",
															"absolute inset-y-0 right-0 flex items-center pr-4",
														)}
													>
														<CheckIcon className="h-5 w-5" aria-hidden="true" />
													</span>
												) : null}
											</>
										)}
									</Combobox.Option>
								))}
							</Combobox.Options>
						</Transition>
					</div>
				)}
			</Combobox>
		);

	return <h1>Loading...</h1>;
};

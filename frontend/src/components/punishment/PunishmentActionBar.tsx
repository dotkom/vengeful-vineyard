import { Menu, Switch, Transition } from "@headlessui/react";
import { EllipsisHorizontalIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	type Dispatch,
	Fragment,
	type ReactNode,
	type SetStateAction,
} from "react";
import type { GroupUser } from "../../helpers/types";

import {
	groupLeaderboardQuery,
	postAllPunishmentsPaidForUserMutation,
} from "../../helpers/api";
import { cn } from "../../helpers/classNames";
import { useCurrentUser } from "../../helpers/context/currentUserContext";
import { useGivePunishmentModal } from "../../helpers/context/modal/givePunishmentModalContext";
import { useTogglePunishments } from "../../helpers/context/togglePunishmentsContext";
import { PunishmentActionBarListItem } from "./PunishmentActionBarListItem";
import { usePermission } from "../../helpers/permissions";

interface PunishmentActionBarProps {
	user: GroupUser;
	label?: string;
}

interface ActionBarItem {
	label: string;
	icon: ReactNode;
	onClick?: () => void;
}

export const PunishmentActionBar = ({
	user,
	label,
}: PunishmentActionBarProps) => {
	let setOpen: Dispatch<SetStateAction<boolean>>;
	let setPreferredSelectedPerson: Dispatch<
		SetStateAction<GroupUser | undefined>
	>;
	let isToggled: boolean | undefined;
	let setIsToggled: Dispatch<SetStateAction<boolean>> | undefined;

	const { currentUser } = useCurrentUser();

	const { data: groupData } = useQuery(groupLeaderboardQuery(user.group_id));

	const {
		setOpen: newSetOpen,
		setPreferredSelectedPerson: newSetPreferredSelectedPerson,
	} = useGivePunishmentModal();
	setOpen = newSetOpen;
	setPreferredSelectedPerson = newSetPreferredSelectedPerson;

	const { isToggled: newIsToggled, setIsToggled: newSetIsToggled } =
		useTogglePunishments();
	isToggled = newIsToggled;
	setIsToggled = newSetIsToggled;

	const { mutate: mutateMarkAllPunishmentsAsPaid } = useMutation(
		postAllPunishmentsPaidForUserMutation(user.group_id, user.user_id),
	);

	const listItems: ActionBarItem[] = [];
	const currentGroupUser = groupData?.members.find(
		(groupUser) => groupUser.user_id === currentUser?.user_id,
	);
	if (currentGroupUser) {
		listItems.push({
			label: "Gi straff",
			icon: <PlusIcon className="h-5 w-5 text-black" />,
			onClick: () => {
				setOpen(true);
				setPreferredSelectedPerson(user as GroupUser);
			},
		});

		if (usePermission("group.punishments.mark_paid", groupData)) {
			listItems.push({
				label: "Marker alle straffer som betalte",
				icon: <PlusIcon className="h-5 w-5 text-black" />,
				onClick: () => {
					mutateMarkAllPunishmentsAsPaid();
				},
			});
		}
	}

	return (
		<div
			className={cn(
				`w-full h-16 border-t flex flex-row items-center px-4 justify-between dark:border-gray-700`,
				!label && listItems.length === 0 ? "hidden" : "",
			)}
		>
			{setIsToggled ? (
				<div className="flex flex-row gap-x-2 items-center">
					<Switch
						checked={isToggled}
						onChange={setIsToggled}
						className={`${
							isToggled ? "bg-blue-600" : "bg-gray-200"
						} relative inline-flex h-6 w-11 items-center rounded-full`}
					>
						<span className="sr-only">Toggle shown punishments</span>
						<span
							className={`${
								isToggled ? "translate-x-6" : "translate-x-1"
							} inline-block h-4 w-4 transform rounded-full bg-white transition`}
						/>
					</Switch>
					<span className="text-xs md:text-sm text-slate-600">
						Vis betalte straffer
					</span>
				</div>
			) : (
				<span></span>
			)}
			{label && <p className="text-sm text-slate-600">{label}</p>}
			{listItems.length > 0 ? (
				<Menu as="div" className="relative">
					<div>
						<Menu.Button className="flex rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-2">
							<span className="sr-only">Open user menu</span>
							<EllipsisHorizontalIcon className="h-10 w-10 text-slate-600" />
						</Menu.Button>
					</div>
					<Transition
						as={Fragment}
						enter="transition ease-out duration-200"
						enterFrom="transform opacity-0 scale-95"
						enterTo="transform opacity-100 scale-100"
						leave="transition ease-in duration-75"
						leaveFrom="transform opacity-100 scale-100"
						leaveTo="transform opacity-0 scale-95"
					>
						<Menu.Items className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none !overflow-visible">
							{listItems.map((item, i) => (
								<PunishmentActionBarListItem
									key={i}
									label={item.label}
									icon={item.icon}
									onClick={item.onClick}
								/>
							))}
						</Menu.Items>
					</Transition>
				</Menu>
			) : (
				<span></span>
			)}
		</div>
	);
};

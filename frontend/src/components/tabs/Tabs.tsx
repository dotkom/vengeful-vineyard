import type { FC } from "react";
import { Tab } from "@headlessui/react";
import { cn } from "../../helpers/classNames";

interface TabsProps {
	label?: string;
	categories: { label: string; content: JSX.Element }[];
	onChange?: (index: number) => void;
}

export const Tabs: FC<TabsProps> = ({ label, categories, onChange }) => {
	return (
		<div className="w-full">
			<Tab.Group onChange={onChange}>
				{label && (
					<span className="font-bold text-sm ml-1 text-gray-700">{label}</span>
				)}
				<Tab.List
					className={cn(
						"flex flex-row gap-x-1 rounded-md bg-slate-200/50 p-1",
						label ? "mt-1" : "",
					)}
				>
					{categories.map((category, i) => (
						<Tab
							key={category.label + i}
							className={({ selected }) =>
								cn(
									"w-full rounded-md py-2 text-sm font-medium leading-5",
									"ring-white/60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2",
									selected
										? "bg-white text-gray-700 shadow"
										: "text-gray-700 hover:bg-white/[0.3] hover:text-gray-800",
								)
							}
						>
							{category.label}
						</Tab>
					))}
				</Tab.List>
				<Tab.Panels className="mt-2">
					{Object.values(categories).map((category, idx) => (
						<Tab.Panel key={idx}>{category.content}</Tab.Panel>
					))}
				</Tab.Panels>
			</Tab.Group>
		</div>
	);
};

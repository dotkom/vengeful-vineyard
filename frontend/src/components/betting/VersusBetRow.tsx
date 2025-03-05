import { type ComponentProps, ReactNode } from "react";
import { cn } from "../../helpers/classNames";
import { textToEmoji } from "../../helpers/emojies";
import { Badge } from "../badge";

interface VersusBetRowProps extends ComponentProps<"li"> {}

export const VersusBetRow = ({ className }: VersusBetRowProps) => {
	const user1 = "Brage Baugerød";
	const user2 = "Jo Gramnæs Tjernshaugen";
	const description = "Hvem trakter raskest?";

	return (
		<li
			className={cn(
				"w-full flex flex-col bg-white p-4 border border-slate-100 dark:border-none rounded-lg text-black",
				className,
			)}
		>
			<div className="flex flex-row gap-x-2 items-center border-b border-slate-200 dark:border-slate-700 pb-3 mb-3">
				<p>Versus bet</p>
				<div className="ml-auto flex flex-row gap-x-2 items-center rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1">
					<span className="text-sm">1x🍷</span>
				</div>
				<Badge color="green" size="sm" variant="secondary">
					Active
				</Badge>
			</div>
			<div className="flex flex-row gap-x-8 justify-between">
				<div className="flex flex-row gap-x-2 items-center">
					<span className="h-10 w-10 bg-indigo-100 dark:bg-gray-800 flex items-center justify-center rounded-full text-2xl">
						{textToEmoji(user1)}
					</span>
					<p className="text-sm">{user1}</p>
				</div>
				<div className="flex flex-row gap-x-2 items-center">
					<p className="text-sm text-right">{user2}</p>
					<span className="h-10 w-10 bg-indigo-100 dark:bg-gray-800 flex items-center justify-center rounded-full text-2xl">
						{textToEmoji(user2)}
					</span>
				</div>
			</div>
		</li>
	);
};

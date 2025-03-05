import React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { cn } from "../../helpers/classNames";

export const AccordionItem = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<typeof Accordion.Item>
>(({ children, className, ...props }, forwardedRef) => (
	<Accordion.Item {...props} ref={forwardedRef} className={className}>
		{children}
	</Accordion.Item>
));

export const AccordionTrigger = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Accordion.Trigger>
>(({ children, className, ...props }, forwardedRef) => (
	<Accordion.Header className="flex">
		<Accordion.Trigger
			className={cn(
				"hover:bg-mauve2 group flex flex-1 cursor-default items-center justify-between bg-white px-5 text-[15px] leading-none outline-none",
				className ?? "",
			)}
			{...props}
			ref={forwardedRef}
		>
			{children}
			<ChevronDownIcon
				className="text-violet10 ease-[cubic-bezier(0.87,_0,_0.13,_1)] transition-transform duration-300 group-data-[state=open]:rotate-180 shrink-0"
				aria-hidden
			/>
		</Accordion.Trigger>
	</Accordion.Header>
));

export const AccordionContent = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<typeof Accordion.Content>
>(({ children, className, ...props }, forwardedRef) => (
	<Accordion.Content
		className={cn(
			"data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp text-[15px]",
			className ?? "",
		)}
		{...props}
		ref={forwardedRef}
	>
		<div className="">{children}</div>
	</Accordion.Content>
));

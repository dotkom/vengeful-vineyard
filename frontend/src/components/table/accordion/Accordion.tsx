import React from "react"
import * as Accordion from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import { classNames } from "../../../helpers/classNames"

export const AccordionItem = React.forwardRef(({ children, className: _, ...props }, forwardedRef) => (
  <Accordion.Item {...props} ref={forwardedRef}>
    {children}
  </Accordion.Item>
))

export const AccordionTrigger = React.forwardRef(({ children, className: _, ...props }, forwardedRef) => (
  <Accordion.Header className="flex">
    <Accordion.Trigger
      className={classNames(
        "group flex flex-1 cursor-default items-center justify-between bg-white px-5 text-[15px] leading-none outline-none hover:bg-mauve2",
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      {children}
      <ChevronDownIcon
        className="text-violet10 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
        aria-hidden
      />
    </Accordion.Trigger>
  </Accordion.Header>
))

export const AccordionContent = React.forwardRef(({ children, className, ...props }, forwardedRef) => (
  <Accordion.Content
    className={classNames(
      "overflow-hidden text-[15px] data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp",
      className
    )}
    {...props}
    ref={forwardedRef}
  >
    <div className="">{children}</div>
  </Accordion.Content>
))

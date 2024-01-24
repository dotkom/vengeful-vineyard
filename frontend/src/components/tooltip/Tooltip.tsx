import React from 'react'

interface TooltipProps {
    names: string[];
    children: React.ReactNode;
    }

export default function Tooltip({ names, children }: TooltipProps,) {
    let tooltipText = "";
    if (names.length < 2) {
        tooltipText = names[0];
    }
    else if (names.length == 2) {
        tooltipText = names[0] + " og " + names[1];
    }
    else {
        tooltipText = names.slice(0, names.length - 1).join(", ") + " og " + names[names.length - 1];
    }
    return (
    <div className="relative inline-block group">
        <div className='absolute w-40 text-white bg-black bg-opacity-75 p-2 text-center rounded-md z-10 opacity-0 group-hover:opacity-100 transition-opacity delay-300 duration-250'>
        {tooltipText}
        </div>
        {children}
    </div>
  )
}
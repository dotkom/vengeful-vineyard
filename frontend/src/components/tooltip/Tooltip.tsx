import React from "react"

interface TooltipProps {
  names: string[]
}

export default function Tooltip({ names }: TooltipProps) {
  let tooltipText = ""
  if (names.length < 2) {
    tooltipText = names[0]
  } else if (names.length == 2) {
    tooltipText = names[0] + " og " + names[1]
  } else {
    tooltipText = names.slice(0, names.length - 1).join(", ") + " og " + names[names.length - 1]
  }
  return (
    <div className="relative hidden group-hover:inline-block">
      <div className="absolute -left-12 top-7">
        <div className="absolute min-w-[100px] max-w-xs text-white bg-black bg-opacity-75 p-2 text-center rounded-md z-10">
          {tooltipText}
        </div>
        <div className="absolute -bottom-1 left-2 w-5 h-5 bg-black transform rotate-45 origin-bottom-left"></div>
      </div>
    </div>
  )
}

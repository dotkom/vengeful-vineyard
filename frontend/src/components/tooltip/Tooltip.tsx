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
    <div className="relative hidden group-hover:inline-block animate-fadeIn z-50">
      <div className="absolute -left-12 top-7">
        <div className="absolute min-w-[120px] text-center text-white bg-black opacity-90 p-2 rounded-md z-10 text-sm font-medium">
          {tooltipText}
        </div>
        <div className="absolute -bottom-1 left-5 w-5 h-5 bg-black opacity-90 transform rotate-45 origin-bottom-left" />
      </div>
    </div>
  )
}

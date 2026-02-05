import { ReactNode } from "react"

interface WheelLayoutProps {
  fullscreen: boolean
  wheel: ReactNode
  controls: ReactNode
  controlsTitle?: string
}

export const WheelLayout = ({ fullscreen, wheel, controls, controlsTitle = "Spillere" }: WheelLayoutProps) => {
  if (fullscreen) {
    return (
      <div className="h-full flex gap-8 items-center">
        <div className="flex-1 flex items-center justify-center">{wheel}</div>
        <div className="w-80 h-full flex flex-col gap-y-4 bg-white/10 rounded-2xl p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white">{controlsTitle}</h3>
          {controls}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-y-4">
      {wheel}
      {controls}
    </div>
  )
}

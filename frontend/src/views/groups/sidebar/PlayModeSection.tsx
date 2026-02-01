import { FC } from "react"
import { RouletteWidget } from "../../../components/playmode"
import { usePlayMode } from "../../../helpers/context/playModeContext"
import { SidebarSection } from "./SidebarSection"
import { Group, GroupUser } from "../../../helpers/types"
import { AiFillInfoCircle } from "react-icons/ai"

interface PlayModeSectionProps {
  members?: GroupUser[]
  groupData?: Group
}

export const PlayModeSection: FC<PlayModeSectionProps> = ({ members = [], groupData }) => {
  const { isPlayModeEnabled, setIsPlayModeEnabled } = usePlayMode()

  return (
    <>
      {/* Compact horizontal toggle with hover info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 relative">
          <span className="text-sm text-gray-600">Prøv lekemodus</span>
          <div className="group">
            <AiFillInfoCircle className="h-4 w-4 text-gray-400 cursor-help" />
            <div className="absolute z-20 top-6 left-0 hidden group-hover:block w-48">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                <p className="text-xs text-gray-500">
                  Aktiver lekemodus for å generere straffer med flaks!
                </p>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsPlayModeEnabled(!isPlayModeEnabled)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            isPlayModeEnabled ? "bg-indigo-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
              isPlayModeEnabled ? "translate-x-[18px]" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {isPlayModeEnabled && (
        <SidebarSection title="Roulette">
          <RouletteWidget members={members} groupData={groupData} />
        </SidebarSection>
      )}
    </>
  )
}

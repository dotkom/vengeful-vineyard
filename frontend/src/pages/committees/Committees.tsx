import { useState } from "react"
import { AiFillInfoCircle } from "react-icons/ai"
import { CommitteeList } from "../../components/committees/CommitteeList"

type ViewMode = "general" | "gambling"

export const Committees = () => {
  const [view, setView] = useState<ViewMode>("general")

  return (
    <section className="mt-8 mb-8 md:mt-16 max-w-screen-xl w-[90%] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center mb-14 max-w-[1150px] mx-auto">
        <div className="hidden lg:flex lg:flex-1">
          <ViewTabs view={view} setView={setView} />
        </div>
        <h1 className="text-center md:text-xl font-medium text-black">Total straffesum per komité</h1>
        <div className="hidden lg:flex lg:flex-1" />
        <ViewTabs view={view} setView={setView} className="lg:hidden mt-2 justify-center" />
      </div>
      <CommitteeList gamblingOnly={view === "gambling"} />
    </section>
  )
}

interface ViewTabsProps {
  view: ViewMode
  setView: React.Dispatch<React.SetStateAction<ViewMode>>
  className?: string
}

const ViewTabs = ({ view, setView, className }: ViewTabsProps) => {
  return (
    <div className={`flex space-x-2 text-sm ${className}`}>
      <button
        onClick={() => setView("general")}
        className={`w-24 border border-gray-200 dark:border-gray-600 py-1 rounded-lg bg-white dark:text-slate-400 ${
          view === "general" ? "bg-slate-100 dark:bg-slate-800" : ""
        }`}
      >
        Generelt
      </button>
      <div className="relative group">
        <button
          onClick={() => setView("gambling")}
          className={`flex items-center gap-1 w-24 justify-center border border-gray-200 dark:border-gray-600 py-1 rounded-lg bg-white dark:text-slate-400 ${
            view === "gambling" ? "bg-slate-100 dark:bg-slate-800" : ""
          }`}
        >
          Gambling
          <AiFillInfoCircle className="h-3.5 w-3.5 text-gray-400" />
        </button>
        <div className="absolute z-20 top-9 left-1/2 -translate-x-1/2 hidden group-hover:block w-72">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Gambling-oversikten</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Her ser du kun straffer fra Roulette og Lykkehjulet. Hvilken komité tørr å satse mest?
            </p>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <div>
                Bruk lekemodus på komitésiden for å spinne hjulet og gi straffer. Alt
                teller hit!
              </div>
              <div className="font-medium text-indigo-500 dark:text-indigo-400">
                Spinn hjulet og klatre på rankingen!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

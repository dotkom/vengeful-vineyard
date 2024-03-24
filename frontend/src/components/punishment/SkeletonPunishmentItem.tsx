export const SkeletonPunishmentItem = () => (
  <div className="flex flex-col gap-2 animate-pulse cursor-pointer justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
    <div className="flex flex-row w-full justify-between gap-x-2">
      <span className="h-4 w-32 rounded-full bg-slate-300 text-sm font-semibold leading-6 text-gray-900" />
      <span className="h-4 w-32 rounded-full bg-slate-300 text-sm font-semibold leading-6 text-gray-900" />
    </div>
    <span className="h-4 w-48 rounded-full bg-slate-300 text-sm font-semibold leading-6 text-gray-900" />
  </div>
)

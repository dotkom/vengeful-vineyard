export const SkeletonTableItem = () => (
  <div className="relative flex animate-pulse cursor-pointer justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
    <div className="flex items-center gap-x-2">
      <span className="h-12 w-12 flex-none rounded-full bg-slate-300" />
      <span className="h-6 w-32 rounded-full bg-slate-300 text-sm font-semibold leading-6 text-gray-900" />
    </div>
  </div>
)

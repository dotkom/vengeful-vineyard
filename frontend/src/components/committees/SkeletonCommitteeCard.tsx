export const SkeletonCommitteeCard = () => (
  <div className="bg-white shadow-lg rounded-lg p-6 pb-5 flex flex-col items-center w-60 h-[288px] animate-pulse">
    <div className="mb-4 flex">
      <span className="h-32 w-32 flex-none rounded-full bg-slate-300" />
    </div>
    <div className="flex flex-col gap-5 items-center">
      <span className="h-6 w-20 rounded-full bg-slate-300 text-sm font-semibold leading-6 text-gray-900" />
      <span className="h-6 w-40 rounded-full bg-slate-300 text-sm font-semibold leading-6 text-gray-900" />
    </div>
  </div>
)

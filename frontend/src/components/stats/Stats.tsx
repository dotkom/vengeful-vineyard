const stats = [
  {
    name: "Antall vinstraffer",
    stat: "71897",
  },
  {
    name: "Straffer forrige uke",
    stat: "10",
  },
  {
    name: "Total",
    stat: "10000,-",
  },
];

export const Stats = () => (
  <div className="h-full max-w-5xl md:m-auto pt-8">
    <dl className="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow md:grid-cols-3 md:divide-x md:divide-y-0">
      {stats.map((item) => (
        <div key={item.name} className="px-4 py-5 sm:p-6">
          <dt className="text-base font-normal text-gray-900">{item.name}</dt>
          <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
            <div className="flex items-baseline text-2xl font-semibold text-indigo-600">
              {item.stat}
            </div>
          </dd>
        </div>
      ))}
    </dl>
  </div>
);

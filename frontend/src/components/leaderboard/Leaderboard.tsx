const mockData = [
  { name: "smoothbrain", numOfBeers: 4, numOfWine: 14 },
  { name: "b-rage", numOfBeers: 2, numOfWine: 99 },
  { name: "thomas", numOfBeers: 17, numOfWine: 20 },
  { name: "anhkha", numOfBeers: 0, numOfWine: 3 },
  { name: "1", numOfBeers: 0, numOfWine: 3 },
  { name: "2", numOfBeers: 0, numOfWine: 3 },
  { name: "3", numOfBeers: 0, numOfWine: 3 },
  { name: "4", numOfBeers: 0, numOfWine: 3 },
];

export const Leaderboard = () => (
  <article className="bg-white h-full max-w-5xl md:m-auto md:rounded shadow-inner">
    <table className="w-full border-separate border-spacing-x-4 border-spacing-y-8">
      <thead>
        <tr className="text-slate-600 border-b">
          <th className="text-left">Navn</th>
          <th>Øl</th>
          <th>Vin</th>
        </tr>
      </thead>
      <tbody>
        {mockData.map((person) => (
          <tr key={person.name} className="font-thin">
            <th className="text-left flex items-center gap-2 text-slate-800">
              <figure className="w-8 h-8 rounded-full bg-pink-300" />
              {person.name}
            </th>
            <th>🍺{person.numOfBeers}</th>
            <th>🍷{person.numOfWine}</th>
          </tr>
        ))}
      </tbody>
    </table>
  </article>
);

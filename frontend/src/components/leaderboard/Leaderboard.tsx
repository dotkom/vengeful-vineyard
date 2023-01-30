export const Leaderboard = () => (
  <article className="bg-white h-full">
    <table className="w-full border-separate border-spacing-4">
      <thead>
        <tr className="text-slate-8 border-b">
          <th className="text-left">Navn</th>
          <th>Øl</th>
          <th>Vin</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th className="text-left flex items-center gap-2">
            <figure className="w-8 h-8 rounded-full bg-blue-2" />
            Smoothbrain
          </th>
          <th>🍺4</th>
          <th>🍷10</th>
        </tr>
      </tbody>
    </table>
  </article>
);

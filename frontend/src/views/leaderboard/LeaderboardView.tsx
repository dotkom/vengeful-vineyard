import { useState } from "react";
import { Leaderboard } from "../../components/leaderboard";
import { Tabbar } from "../../components/tabbar";
import { WallOfRequests } from "../../components/wallOfRequests";
import { WallOfShame } from "../../components/wallOfShame";

export const LeaderboardView = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <section className="-mt-32">
      <Tabbar
        selectedTabIndex={selectedTabIndex}
        setSelectedTabIndex={setSelectedTabIndex}
      />
      {selectedTabIndex === 0 && <Leaderboard />}
      {selectedTabIndex === 1 && <WallOfShame />}
      {selectedTabIndex === 2 && <WallOfRequests />}
    </section>
  );
};

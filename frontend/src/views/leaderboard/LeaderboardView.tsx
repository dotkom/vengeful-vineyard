import { useState } from "react";
import { Tabbar } from "../../components/tabbar";
import { Table } from "../../components/table";
import { WallOfRequests } from "../../components/wallOfRequests";
import { WallOfShame } from "../../components/wallOfShame";

export const LeaderboardView = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <section className="-mt-32 z-10">
      <Tabbar
        selectedTabIndex={selectedTabIndex}
        setSelectedTabIndex={setSelectedTabIndex}
      />
      {selectedTabIndex === 0 && <Table />}
      {selectedTabIndex === 1 && <WallOfShame />}
      {selectedTabIndex === 2 && <WallOfRequests />}
    </section>
  );
};

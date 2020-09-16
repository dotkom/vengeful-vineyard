import React from "react";
import SortAccordions from "./SortAccordions";
import ChoosePunishments from "./ChoosePunishments";

import { getCurrentGroup } from "../Top_group_picker_components/GroupLogos";

const SortNav = (props) => {
  return (
    <div className="sortNav">
      <div className="committeeName">
        <h2 className="groupTitle">Noe</h2>
        <hr></hr>
      </div>

      <SortAccordions />
      <ChoosePunishments />
    </div>
  );
};

export default SortNav;

import React from "react";
import SortNav from "../Components/Left_navbar_components/SortNav";
import GroupPickerContainer from "../Components/Top_group_picker_components/GroupPickerContainer";
import PunishmentContainer from "../Components/PunishmentDisplay/PunishmentContainer";

import { getCurrentGroup } from "../Components/Top_group_picker_components/GroupLogos";

import "../Style/Styles.css";

function App() {
  return (
    <div className="content">
      <GroupPickerContainer />
      <div className="body_content">
        <SortNav />
        <PunishmentContainer />
      </div>
    </div>
  );
}

export default App;

import React, { useState } from "react";
import Accordion from "../Left_navbar_components/Accordion";

import users from "../../FakeData/MOCK_DATA.json";

const PunishmentContainer = () => {
  return (
    <div className="punishmentContainer">
      <div className="groupPunishments"></div>
      <Accordion
        title=" "
        content={
          <div className="accordion__content">{/*<PunishmentsDetails />*/}</div>
        }
      />
    </div>
  );
};

export default PunishmentContainer;

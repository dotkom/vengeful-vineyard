import React, { useState } from "react";

import users from "../../FakeData/MOCK_DATA.json";

let chosenGroup = "";

const changeActive = (path) => {
  let currentGroup = users.filter((user) => user.group_logo === path);

  console.log(currentGroup[1].group);
  updateGroup(currentGroup[1].group);
  getCurrentGroup();
  return currentGroup[1].group;
};

const updateGroup = (newGroup) => {
  chosenGroup = newGroup;
  console.log("Group updated");
  console.log(chosenGroup);
};

export const getCurrentGroup = () => {
  console.log("Getting current group: " + chosenGroup);
  return chosenGroup;
};

const GroupLogos = () => {
  //setGroups skal oppdatere hvilke grupper som vises når man legger til nye,,
  const [unique_groups, setGroups] = useState(
    users
      .map((user) => user.group_logo)
      .filter((url, i, allGroups) => allGroups.indexOf(url) === i)
  );

  return (
    <div className="groupLogosContainer">
      {unique_groups.map((e) => (
        <input
          type="image"
          className="groupBtn"
          src={e}
          onClick={(path) => changeActive(e)}
          alt="groupLogo"
        ></input>
      ))}{" "}
    </div>
  );
};

export default GroupLogos;

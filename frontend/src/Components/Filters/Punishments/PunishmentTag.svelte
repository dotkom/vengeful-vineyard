<script lang="ts">
  import { group } from "../../../stores/groups";

  import type { PunishmentType, User } from "src/types";
  import { getGroupUser } from "../../../api";

  import { punishmentsToFilter } from "../../../stores/punishmentToFilter";
  import { users } from "../../../stores/users";

  let close = "assets/close.svg";

  export let punishment: PunishmentType;

  function hasCommonElement(arr1, arr2): boolean {
    return arr1.some((item) => arr2.includes(item));
  }

  const containsPunType = async (user: User): Promise<boolean> => {
    return await getGroupUser($group.group_id, user.user_id).then((res) => {
      let xd = hasCommonElement(
        res.punishments.map((pun) => pun.punishment_type),
        $punishmentsToFilter.map((pun) => pun.punishment_type_id)
      );
      return xd;
    });
  };

  const removePunishment = async (punishmentInput: PunishmentType) => {
    punishmentsToFilter.update((punishments) =>
      punishments.filter(
        (punishment) =>
          punishment.punishment_type_id != punishmentInput.punishment_type_id
      )
    );
    let promises = $users.map((user) => containsPunType(user));
    const toFilter = await Promise.all(promises);
    users.update((users) => users.filter((users, i) => toFilter[i]));
  };
  $: users;
</script>

<div class="wrapper">
  <img
    class="punishment"
    alt="wine"
    src="{punishment.logo_url}"
    width="23"
    height="23"
  />
  <p>{punishment.name}</p>
  <img
    class="close"
    alt="wine"
    src="{close}"
    width="23"
    height="23"
    on:click="{() => removePunishment(punishment)}"
  />
</div>

<style lang="less">
  .wrapper {
    margin: 3px;
    padding: 3px;
    width: fit-content;
    display: flex;
    align-items: center;
    align-content: center;
    flex-direction: row;
    background: #b1d5ea;
    border: 1px solid #6c8da0;
    box-sizing: border-box;
    border-radius: 3px;
    text-align: center;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
      rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
  }

  p {
    font-size: 20px;
    color: #000000;
    font-weight: 400;
  }

  .close {
    padding-left: 4px;
  }

  .close:hover {
    cursor: pointer;
  }

  .punishment {
    padding-right: 2px;
  }
</style>

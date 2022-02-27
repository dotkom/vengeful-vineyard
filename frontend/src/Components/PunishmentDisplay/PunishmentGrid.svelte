<script lang="ts">
  import type { Group, User } from "src/types";
  import { getGroup, getUser, getGroupUser } from "../../api";
  import { users, filteredUsers } from "../../stores/users";
  import { group } from "../../stores/groups";
  import PunishmentInfo from "./PunishmentInfo.svelte";
  import PunishmentRow from "./PunishmentRow.svelte";
  import Table from "svelte-tailwind-table";
  import { TableSort } from "svelte-tablesort";
  import Button from "../Button.svelte";
  import SvelteTable from "svelte-table";
  import { punishmentsToFilter } from "../../stores/punishmentToFilter";
  import { showPaid } from "../../stores/users";

  // import * as $j from "jquery";

  let wine = "assets/wineglass.svg";
  let group_id: number = 2;
  // let fetchedGroup: Group;
  getGroup(group_id).then(async (res) => {
    //group.set(res);
    window.localStorage.setItem("group", JSON.stringify(res));
    window.localStorage.setItem(
      "users",
      JSON.stringify(
        await Promise.all(
          $group.members.map(async (member) =>
            getGroupUser($group.group_id, member.user_id)
          )
        )
      )
    );
    // console.log(
    //   await Promise.all(
    //     $group.members.map(async (member) =>
    //       getGroupUser($group.group_id, member.user_id)
    //     )
    //   )
    // );
    window.localStorage.setItem(
      "punishmentFilters",
      JSON.stringify(res.punishment_types)
    );
  });

  const getLastPunishedDate = (user: User) => {
    let date: String = "";
    try {
      date =
        user.punishments[user.punishments.length - 1].created_time.split(
          "T"
        )[0];
    } catch (TypeError) {
      return "No date";
    }
    return date;
  };

  const rows = [
    { id: 1, first_name: "Marilyn", last_name: "Monroe", pet: "dog" },
    { id: 2, first_name: "Abraham", last_name: "Lincoln", pet: "dog" },
    { id: 3, first_name: "Mother", last_name: "Teresa", pet: "" },
    { id: 4, first_name: "John F.", last_name: "Kennedy", pet: "dog" },
    { id: 5, first_name: "Martin Luther", last_name: "King", pet: "dog" },
    { id: 6, first_name: "Nelson", last_name: "Mandela", pet: "cat" },
    { id: 7, first_name: "Winston", last_name: "Churchill", pet: "cat" },
    { id: 8, first_name: "George", last_name: "Soros", pet: "bird" },
    { id: 9, first_name: "Bill", last_name: "Gates", pet: "cat" },
    { id: 10, first_name: "Muhammad", last_name: "Ali", pet: "dog" },
    { id: 11, first_name: "Mahatma", last_name: "Gandhi", pet: "bird" },
    { id: 12, first_name: "Margaret", last_name: "Thatcher", pet: "cat" },
    { id: 13, first_name: "Christopher", last_name: "Columbus", pet: "dog" },
    { id: 14, first_name: "Charles", last_name: "Darwin", pet: "dog" },
    { id: 15, first_name: "Elvis", last_name: "Presley", pet: "dog" },
    { id: 16, first_name: "Albert", last_name: "Einstein", pet: "dog" },
    { id: 17, first_name: "Paul", last_name: "McCartney", pet: "cat" },
    { id: 18, first_name: "Queen", last_name: "Victoria", pet: "dog" },
    { id: 19, first_name: "Pope", last_name: "Francis", pet: "cat" },
    // etc...
  ];

  const maybRows = $filteredUsers.map((user) => {
    return {
      id: user.user_id,
      user: user,
      name: `${user.first_name} ${user.last_name}`,
      straffer: user.punishments,
      sist_straffet: getLastPunishedDate(user),
    };
  });

  console.log(maybRows);

  // define column configs
  const columns = [
    {
      key: "name",
      title: "Navn",
      value: (v) => v.name,
      sortable: true,
    },
    {
      key: "straffer",
      title: "Straffer",
      value: (v) => v.straffer.length,
      sortable: true,
    },
    {
      key: "sist_straffet",
      title: "Sist straffet",
      value: (v) => v.sist_straffet,
      sortable: true,
    },
  ];
</script>

<div class="punishment_grid">
  <SvelteTable
    columns="{columns}"
    rows="{maybRows}"
    showExpandIcon="{true}"
    expandRowKey="id"
    ><svelte:fragment slot="expanded" let:row>
      <PunishmentInfo
        p_types="{$group.punishment_types}"
        punishments="{row.user.punishments
          .filter((pun) =>
            $punishmentsToFilter
              .map((pun) => pun.punishment_type_id)
              .includes(pun.punishment_type)
          )
          .filter((pun) => ($showPaid ? pun : pun.verified_time === null))}"
      /></svelte:fragment
    >
  </SvelteTable>
  <!-- {#each $filteredUsers as user}
    <div
      tabindex="0"
      class="collapse w-full border rounded-box border-base-300 collapse-arrow"
    >
      {#await getGroupUser(group_id, user.user_id) then userInfo}
        <PunishmentRow user="{userInfo}" p_types="{$group.punishment_types}" />
      {/await}
    </div>
  {/each} -->

  <!-- {/each}
  {/await} -->
</div>

<!-- {console.log(members)} -->
<style lang="less">
  @import "../../variables.less";
  .accordion_text {
    @apply flex flex-row justify-between text-gray-500;
  }
  .name {
    min-width: 7em;
  }
  .icon {
    @apply min-h-6;
  }
  .icons {
    @apply flex justify-center;
  }
  .punishment_grid {
    @apply mt-4;
  }
</style>

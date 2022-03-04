<script lang="ts">
  import type { Punishment, User } from "src/types";
  import { getGroup, getGroupUser } from "../../api";
  import {
    filteredUsers,
    onlyShowAfterDate,
    onlyShowBeforeDate,
  } from "../../stores/users";
  import { group } from "../../stores/groups";
  import PunishmentInfo from "./PunishmentInfo.svelte";

  import SvelteTable from "svelte-table";
  import PunishmentsListed from "./PunishmentsListed.svelte";
  import { punishmentsToFilter } from "../../stores/punishmentToFilter";
  import { showPaid } from "../../stores/users";

  let group_id: number = 2;

  getGroup(group_id).then(async (res) => {
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

  /**
   * Creates a new object that stores punishment ids and punishment values.
   * @returns a dictionary-like object where punishment type id are the keys, and punishment values are values.
   */
  const mapTypes = () => {
    let mappedTypes = {};
    $group.punishment_types.map(
      (p) => (mappedTypes[p.punishment_type_id] = p.value)
    );
    return mappedTypes;
  };

  /**
   * Calculates the total sum in NOK of punishments
   * @returns the total sum as number
   */
  const calculateSum = (punishments: Punishment[]): number => {
    let dict = mapTypes();
    let sum: number = 0;
    punishments.forEach((punishment) => {
      sum += dict[punishment.punishment_type] * punishment.amount;
    });

    return sum;
  };

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
      value: (v) =>
        calculateSum(
          v.straffer
            .filter((pun) =>
              $punishmentsToFilter
                .map((pun) => pun.punishment_type_id)
                .includes(pun.punishment_type)
            )
            .filter((pun) => ($showPaid ? pun : pun.verified_time === null))
        ),
      sortable: true,
      class: "flex justify-center border-none",
      renderComponent: {
        component: PunishmentsListed,
        props: {
          p_types: $group.punishment_types,
        },
      },
    },
    {
      key: "sist_straffet",
      title: "Sist straffet",
      value: (v) => v.sist_straffet,
      sortable: true,
      class: "text-center",
    },
  ];

  let expanded1 = "";
  let expandedCache = "";
  let expandedArr = [];
  $: {
    // 2-way binding setup between input and table expanded items
    if (expandedCache === expanded1) {
      // update string
      expanded1 = expandedArr.join(",");
    } else {
      // update array
      expandedArr = expanded1.split(",").map((n) => parseInt(n));
    }
    expandedCache = expanded1;
  }

  function handleRowClick(event) {
    // manually toggle expanded items
    const row = event.detail.row;
    if (!row.$expanded) {
      expandedArr = [...expandedArr, row.id];
    } else {
      expandedArr = expandedArr.filter((id) => id !== row.id);
    }
  }
  function handleExpand(event) {
    const row = event.detail.row;
    const operation = row.$expanded ? "open" : "close";
  }
</script>

<div class="punishment_grid">
  <SvelteTable
    columns="{columns}"
    rows="{$filteredUsers.map((user) => {
      return {
        id: user.user_id,
        user: user,
        name: `${user.first_name} ${user.last_name}`,
        straffer: user.punishments,
        sist_straffet: getLastPunishedDate(user),
      };
    })}"
    showExpandIcon="{false}"
    iconAsc="{'↑'}"
    iconDesc="{'↓'}"
    classNameTable="table bg-white border-solid border border-slate-400 rounded-md text-center shadow-md text-[##333333]"
    classNameThead="table-primary h-20 border-double border-b border-slate-400"
    classNameRow="cursor-pointer border-solid border-b-2 border-slate-400"
    classNameRowExpanded="row-expanded"
    classNameExpandedContent="expanded-content bg-[#F2F2F2] shadow-inner border-solid border-b-2 border-slate-400"
    bind:expanded="{expandedArr}"
    expandRowKey="id"
    on:clickRow="{handleRowClick}"
    ><svelte:fragment slot="expanded" let:row>
      <PunishmentInfo
        totalSum="{calculateSum(
          row.user.punishments
            .filter((pun) =>
              $punishmentsToFilter
                .map((pun) => pun.punishment_type_id)
                .includes(pun.punishment_type)
            )
            .filter(
              (pun) =>
                (new Date(pun.created_time).getTime() >=
                  $onlyShowAfterDate.getTime() &&
                  new Date(pun.created_time).getTime() <=
                    $onlyShowBeforeDate.getTime()) ||
                (new Date(pun.created_time).getDate() ==
                  $onlyShowAfterDate.getDate() &&
                  new Date(pun.created_time).getMonth() ==
                    $onlyShowAfterDate.getMonth() &&
                  new Date(pun.created_time).getFullYear() ==
                    $onlyShowAfterDate.getFullYear()) ||
                (new Date(pun.created_time).getDate() ==
                  $onlyShowBeforeDate.getDate() &&
                  new Date(pun.created_time).getMonth() ==
                    $onlyShowBeforeDate.getMonth() &&
                  new Date(pun.created_time).getFullYear() ==
                    $onlyShowBeforeDate.getFullYear())
            )
            .filter((pun) => ($showPaid ? pun : pun.verified_time === null))
        )}"
        user="{row.user}"
        p_types="{$group.punishment_types}"
        punishments="{row.user.punishments
          .filter((pun) =>
            $punishmentsToFilter
              .map((pun) => pun.punishment_type_id)
              .includes(pun.punishment_type)
          )
          .filter(
            (pun) =>
              (new Date(pun.created_time).getTime() >=
                $onlyShowAfterDate.getTime() &&
                new Date(pun.created_time).getTime() <=
                  $onlyShowBeforeDate.getTime()) ||
              (new Date(pun.created_time).getDate() ==
                $onlyShowAfterDate.getDate() &&
                new Date(pun.created_time).getMonth() ==
                  $onlyShowAfterDate.getMonth() &&
                new Date(pun.created_time).getFullYear() ==
                  $onlyShowAfterDate.getFullYear()) ||
              (new Date(pun.created_time).getDate() ==
                $onlyShowBeforeDate.getDate() &&
                new Date(pun.created_time).getMonth() ==
                  $onlyShowBeforeDate.getMonth() &&
                new Date(pun.created_time).getFullYear() ==
                  $onlyShowBeforeDate.getFullYear())
          )
          .filter((pun) => ($showPaid ? pun : pun.verified_time === null)) ||
          null}"
      /></svelte:fragment
    >
  </SvelteTable>
</div>

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

  .table-primary {
    text-align: center;
    background-color: white;
  }
</style>

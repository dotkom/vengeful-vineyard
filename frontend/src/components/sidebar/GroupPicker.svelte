<script lang="ts">
  import { getGroup } from "../../lib/api";
  import Svelecte, { addFormatter } from "svelecte";
  import { OWgroups } from "../../stores/OWgroups";
  import { group } from "../../stores/group";
  import { Group } from "../../lib/types";
  import { users } from "../../stores/users";
  import { punishmentsToFilter } from "../../stores/punishmentToFilter";

  const myI18n = {
    nomatch: "Ingen matchende grupper",
  };

  let value: string | null = `${$group}`;

  const changeActiveGroup = async (newGroup: Group) => {
    await getGroup(newGroup.group_id).then((res) => {
      group.set(res);
      users.set(res.members);
      punishmentsToFilter.set(res.punishment_types);
    });
  };

  function colorRenderer(newGroup: Group, isSelected: boolean) {
    if (isSelected) {
      changeActiveGroup(newGroup);
      return `<div class="flex flex-row w-fit"><img class="px-0.5" src=${newGroup.logo_url}></img><p>${newGroup.name_short}</p></div>
   `;
    }
    return `<div class="flex flex-row w-fit"><img class="px-0.5" src=${newGroup.logo_url}></img><p>${newGroup.name_short}</p></div>
   `;
  }

  addFormatter({
    "group-blocks": colorRenderer,
  });
</script>

<div class="flex flex-col justify-center m-auto pt-3">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label">
    <span class="label-text">Viser straffer fra gruppe</span>
  </label>

  <Svelecte
    options="{$OWgroups}"
    i18n="{myI18n}"
    renderer="group-blocks"
    inputId="groups"
    bind:value
  />
</div>

<style lang="postcss">
  .label-text {
    color: #eeeeee;
    font-size: 18px;
    float: left;
  }
</style>

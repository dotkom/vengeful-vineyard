<script lang="ts">
  import type { PunishmentType } from "../../../lib/types";
  import { group } from "../../../stores/group";
  import Svelecte, { addFormatter } from "svelecte";
  import { punishmentsToFilter } from "../../../stores/punishmentToFilter";
  import CreateCustomPunishment from "./CreateCustomPunishment.svelte";

  const myI18n = {
    empty: `Alle straffer vises`,
    nomatch: "Ingen matchende straffer",
    createRowLabel: (value: any) => `Opprett straff '${value}'`,
  };

  let value: string | null;

  let displayCreatePunishment: boolean = false;

  const setDisplayCreatePunishment: (display: boolean) => void = (
    display: boolean
  ) => {
    displayCreatePunishment = display;
  };

  let nameOfNewPun: string | null;

  const addPunishment = async (punishmentInput: PunishmentType) => {
    $punishmentsToFilter = [
      ...$punishmentsToFilter,
      {
        name: punishmentInput.name,
        logo_url: punishmentInput.logo_url,
        value: punishmentInput.value,
        punishment_type_id: punishmentInput.punishment_type_id,
      },
    ];
  };

  function colorRenderer(punishment: PunishmentType, isSelected: boolean) {
    if (isSelected) {
      if (!punishment.punishment_type_id) {
        nameOfNewPun = value;
        value = null;
        displayCreatePunishment = true;
      } else {
        addPunishment(punishment);
        value = null;
      }
    }
    return `<div class="flex flex-row w-fit"><img class="px-0.5" src=${punishment.logo_url}></img><p>${punishment.name}</p></div>
     `;
  }

  addFormatter({
    "pun-blocks": colorRenderer,
  });
</script>

{#if $group !== null && $punishmentsToFilter !== null && punishmentsToFilter !== undefined && $group.punishment_types !== undefined}
  <div class="flex flex-col w-full mt-2">
    <label for="punishment">
      <span class="label-text mb-2">Vis strafftyper</span>
    </label>
    <Svelecte
      options="{$group.punishment_types.filter(
        (filterPun) =>
          !$punishmentsToFilter
            .map((groupPun) => groupPun.punishment_type_id)
            .includes(filterPun.punishment_type_id)
      )}"
      i18n="{myI18n}"
      renderer="pun-blocks"
      inputId="punishment"
      bind:value
      placeholder="Navn på straff"
      creatable
    />
  </div>

  {#if displayCreatePunishment}
    <CreateCustomPunishment
      name="{nameOfNewPun}"
      displayCreatePunishment="{displayCreatePunishment}"
      setDisplayCreatePunishment="{setDisplayCreatePunishment}"
    />
  {/if}
{/if}

<style lang="postcss">
  .label-text {
    color: #eeeeee;
    font-size: 18px;
    float: left;
  }
</style>

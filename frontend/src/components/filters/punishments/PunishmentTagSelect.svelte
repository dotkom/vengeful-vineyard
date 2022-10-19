<script lang="ts">
  import type { PunishmentType } from "src/types";
  import { group } from "../../../stores/groups";
  import Svelecte, { addFormatter, config } from "svelecte";
  import { punishmentsToFilter } from "../../../stores/punishmentToFilter";

  const myI18n = {
    empty: `Alle straffer vises`,
    nomatch: "Ingen matchende straffer",
  };

  let value: string;

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
      addPunishment(punishment);
      value = null;
    }
    return `<div class="flex flex-row w-fit"><img class="px-0.5" src=${punishment.logo_url}></img><p>${punishment.name}</p></div>
     `;
  }

  addFormatter({
    "pun-blocks": colorRenderer,
  });
</script>

{#if $group !== null && $punishmentsToFilter !== null}
  <div class="flex flex-col w-full mt-2">
    <label for="punishment"
      ><span class="label-text mb-2">Vis strafftyper</span></label
    >
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
    />
  </div>
{/if}

<style lang="postcss">
  .wrapper {
    height: 1.25rem;
    margin: 3px;
    width: fit-content;
    display: flex;
    align-items: center;
    align-content: center;
    flex-direction: row;
    background: #f1f7ff;
    border: 0.5px solid #c1dff3;
    box-sizing: border-box;
    text-align: center;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding-right: 3px;
  }

  .label-text {
    color: #eeeeee;
    font-size: 18px;
    float: left;
  }

  p {
    font-size: 16px;
    color: #1b618b;
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

  .pun-item {
    display: flex;
    flex-direction: row;
    width: 100%;
  }
</style>

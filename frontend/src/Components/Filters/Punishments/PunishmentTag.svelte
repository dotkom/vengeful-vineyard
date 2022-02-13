<script lang="ts">
  import type { PunishmentType } from "src/types";

  import { punishmentsToFilter } from "../../../stores/punishmentToFilter";

  let close = "assets/close.svg";

  export let punishment: PunishmentType;

  let filterPunishments: PunishmentType[];

  punishmentsToFilter.subscribe((value) => {
    filterPunishments = value;
  });

  const removePunishment = (punishmentInput) => {
    punishmentsToFilter.update((punishments) =>
      punishments.filter((punishment) => punishment.id != punishmentInput.id)
    );
  };
</script>

<div class="wrapper">
  <img
    class="punishment"
    alt="wine"
    src="{punishment.imageurl}"
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

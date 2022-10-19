<script lang="ts">
  import type { PunishmentType } from "src/types";

  import { punishmentsToFilter } from "../../../stores/punishmentToFilter";

  let close = "assets/close.svg";

  export let punishment: PunishmentType;

  const removePunishment = async (punishmentInput: PunishmentType) => {
    punishmentsToFilter.update((punishments) =>
      punishments.filter(
        (punishment) =>
          punishment.punishment_type_id != punishmentInput.punishment_type_id
      )
    );
  };
</script>

<div class="wrapper">
  <img
    class="punishment"
    alt="wine"
    src="{punishment.logo_url}"
    width="20"
    height="20"
  />
  <p>{punishment.name}</p>
  <img
    class="close"
    alt="wine"
    src="{close}"
    width="20"
    height="20"
    on:click="{() => removePunishment(punishment)}"
  />
</div>

<style lang="less">
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
    padding: 6px;
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
</style>

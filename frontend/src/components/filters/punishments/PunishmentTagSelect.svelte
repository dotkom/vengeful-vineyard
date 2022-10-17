<script lang="ts">
  import type { PunishmentType } from "src/types";
  import { group } from "../../../stores/groups";
  import Svelecte, { addFormatter } from "svelecte";
  import { punishmentsToFilter } from "../../../stores/punishmentToFilter";

  let options = $group.punishment_types
    .filter((groupPun) =>
      $punishmentsToFilter.map(
        (filterPun) =>
          groupPun.punishment_type_id !== filterPun.punishment_type_id
      )
    )
    .map((pun) => pun.name);

  let value: string;

  //   function colorRenderer(item, isSelected) {
  //     if (isSelected) {
  //       return `<div class="color-item" style="background-color: ${item.hex}">
  //         Selected color
  //       </div>`;
  //     }
  //     return `<span class="color-item" style="background-color: ${item.hex};">
  //       </span>${item.text}`;
  //   }
  //   // add custom renderer
  //   addFormatter("color-blocks", colorRenderer);
  //   // alternatively you can use object syntax
  //   addFormatter({
  //     "color-blocks": colorRenderer,
  //   });
</script>

<label for="punishment">Select a country</label>
<Svelecte
  options="{options}"
  inputId="punishment"
  bind:value
  placeholder="Navn på straff"
/>

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

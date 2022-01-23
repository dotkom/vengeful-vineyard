<script lang="ts">
  import { deletePunishment } from "../../api";
  import type { Punishment } from "../../types";

  export let punishments: Punishment[];

  let cancelIcon = "assets/red-x.svg";
  // Currently id = 0 is wine and id = 1 is beer, need to fix this later
  let wine = "assets/wineglass.svg";
  let beer = "assets/beerglass.svg";

  /**
   * Calculates the total sum in NOK of punishments
   */
  const calculateSum = () => {
    let sum: number = 0;
    for (let i = 0; i < punishments.length; i++) {
      sum += punishments[i].price;
    }
    return sum;
  };

  const returnDate = (given_time: String) => {
    return given_time.split("T")[0];
  };
</script>

<div class="punishment_info">
  <slot name="punishments" />
  {#each punishments as punishment}
    <div class="punishment">
      <button type="button" on:click="{() => deletePunishment(punishment.id)}">
        <img class="icon" src="{cancelIcon}" alt="Remove punishment" />
      </button>
      <div>{punishment.reason}</div>

      <!-- Add a drink icon for each punishment-->
      {#each Array(punishment.number) as _, i}
        {i + 1}
        <img class="icon" src="{wine}" alt="wineglass" />
      {/each}
      <div>{returnDate(punishment.created_time)}</div>
    </div>
  {:else}
    <div></div>
  {/each}
  <div class="sum">Total sum: {calculateSum()}</div>
</div>

<style lang="less">
  .punishment {
    @apply flex flex-row justify-between mx-2 bg-white p-4;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  }

  .punishment > {
    @apply p-4;
  }
  .icon {
    @apply h-6 w-6;
  }

  .sum {
    @apply m-4 text-right;
  }
</style>

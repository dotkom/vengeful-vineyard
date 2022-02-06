<script lang="ts">
  import { deletePunishment } from "../../api";
  import type { Punishment } from "../../types";

  export let punishments: Punishment[];

  // TODO get icons with internal object path
  let cancelIcon = "assets/red-x.svg";
  let wine = "assets/wineglass.svg";
  let beer = "assets/beerglass.svg";

  /**
   * Calculates the total sum in NOK of punishments
   * @returns the total sum as number
   */
  const calculateSum = () => {
    //TODO calculate sum based on punishment type
    let sum: number = 0;
    for (let i = 0; i < punishments.length; i++) {
      sum += punishments[i].price;
    }
    return sum;
  };

  const returnDate = (given_time: String) => {
    return given_time.split("T")[0];
  };

  /**
   * Deletes a punishment from database and removes the item from GUI.
   * @param id punishment's id
   */
  const removePunishment = (id: number) => {
    deletePunishment(id);
    punishments = punishments.filter((p) => p.punishment_id !== id);
  };
</script>

<div class="punishment_info">
  <slot name="punishments" />
  {#each punishments as punishment}
    <div class="punishment">
      <div
        class="deleteBtn"
        on:click="{() => {
          removePunishment(punishment.punishment_id);
        }}"
      >
        <img class="icon" src="{cancelIcon}" alt="Remove punishment" />
      </div>
      <div>
        <p class="reason">{punishment.reason}</p>
      </div>

      <!-- Add a drink icon for each punishment-->
      <div class="punishment_icons">
        {#each Array(punishment.amount) as _, i}
          <img class="icon" src="{wine}" alt="wineglass" />
        {/each}
      </div>
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

  .punishment p {
    @apply p-4 max-w-xs;
  }

  .punishment > {
    @apply items-center;
  }

  .icon {
    @apply h-6 w-6;
  }

  .sum {
    @apply m-4 text-right;
  }

  .deleteBtn {
    @apply hover:cursor-pointer;
  }

  .punishment_icons {
    @apply flex;
    min-width: 7em;
  }
</style>

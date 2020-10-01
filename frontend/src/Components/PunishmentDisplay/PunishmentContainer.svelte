<script lang="ts">
  import Accordion from "../Left_navbar_components/Accordion.svelte";
  import Vodka from "../Punishment/vodka.svelte";
  import Wine from "../Punishment/wine.svelte";
  import Beer from "../Punishment/beer.svelte";
  import UserStore from "../../stores/users";
  import GroupStore from "../../stores/groups";
  import type { User } from "../../stores/users";

  const punishmentSum = (user: User) => {
    return (
      user.ol_straffer * 33 +
      user.vin_straffer * 100 +
      user.sprit_straffer * 300
    );
  };
</script>

<div class="punishmentContainer">
  {#each $UserStore.filter((s) => s.group == $GroupStore.currentGroup) as user (user.id)}
    <Accordion
      title="{user.first_name} {user.last_name} - Øl: {user.ol_straffer} - Vin: {user.vin_straffer} - Sprit: {user.sprit_straffer}"
      color="#223333"
    >
      <div class="accordion__content">
        Komité:
        {user.group}<br />Stafftotal:
        {punishmentSum(user)}
        NOK<br />
        {#each { length: user.sprit_straffer } as _}
          <Vodka />
        {/each}
        {#each { length: user.vin_straffer } as _}
          <Wine />
        {/each}
        {#each { length: user.ol_straffer } as _}
          <Beer />
        {/each}
      </div>
    </Accordion>
  {/each}
</div>

<style lang="less">
  @import "../../variables.less";
  .punishmentContainer {
    display: flex;
    flex-direction: column;
    width: 70%;
    margin: 0 auto;
  }
</style>

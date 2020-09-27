<script lang="ts">
  import Accordion from "../Left_navbar_components/Accordion.svelte";
  import UserStore from "../../store.ts";

  const punishmentSum = (user) => {
    return (
      user.ol_straffer * 33 +
      user.vin_straffer * 100 +
      user.sprit_straffer * 300
    );
  };
</script>

<div class="punishmentContainer">
  {#each $UserStore as user (user.id)}
    <Accordion
      title="{user.first_name} {user.last_name} - Øl: {user.ol_straffer} - Vin: {user.vin_straffer} - Sprit: {user.sprit_straffer}"
      color="#223333"
    >
      <div class="accordion__content">
        Komité: {user.group}<br />Stafftotal: {punishmentSum(user)} NOK
      </div>
    </Accordion>
  {/each}
</div>

<style>
  .punishmentContainer {
    display: flex;
    flex-direction: column;
    width: 70%;
    margin: 0 auto;
  }
</style>

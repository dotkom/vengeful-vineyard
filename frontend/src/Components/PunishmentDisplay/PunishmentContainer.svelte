<script lang="ts">
  import GroupStore from "../../stores/groups";

  import Accordion from "../Left_navbar_components/Accordion.svelte";
  import Punishment from "../Punishment/punishment.svelte";
  import AddPunishment from "../Punishment/addpunishment.svelte";
</script>

<div class="punishmentContainer">
  {#each $GroupStore.groups.filter((g) => g.name === $GroupStore.currentGroup)[0].users as user (user.id)}
    <Accordion title="{user.name}" color="#223333">
      <div class="accordion__content">
        {#each user.punishments as punish}
          <Punishment {...punish} />
        {/each}
        <AddPunishment
          name="{user.name}"
          punishmentTypes="{$GroupStore.groups.filter((g) => g.name === $GroupStore.currentGroup)[0].validPunishments}"
        />
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

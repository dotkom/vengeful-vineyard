<script lang="ts">
  import UserStore from "../../stores/users";
  import GroupStore from "../../stores/groups";
  import GroupButton from "./GroupButton.svelte";
  import type { User } from "../../stores/users";
  import * as R from 'ramda';

  const users : User[] = $UserStore;
  const groups: any = users
    .map((user : User) => { return {url: user.group_logo, group: user.group} });
  const uniqueGroups = R.uniqBy((a : {url: string, group: string}) => a.url, groups);
  $GroupStore.currentGroup = uniqueGroups[0].group;
</script>

<div class="groupLogosContainer">
  {#each uniqueGroups as {url, group}}
    <GroupButton url={url} group={group}/>
  {/each}
</div>

<style lang="less">
  @import "../../variables.less";
  .groupLogosContainer {
    margin: 0 auto;
  }
</style>

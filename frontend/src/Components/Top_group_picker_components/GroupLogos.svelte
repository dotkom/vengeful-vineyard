<script lang="ts">
  import UserStore from "../../store.ts";
  const users = $UserStore;
  let currentGroup = "";

  const changeActive = () => {
    const currentGroup = users.filter((user) => user.group_logo === "TODO");
    updateGroup(currentGroup[1].group);
    return currentGroup[1].group;
  };

  const updateGroup = (newGroup: string) => {
    currentGroup = newGroup;
  };

  let group_urls: string[] = users
    .map((user) => user.group_logo)
    .filter(
      (url: string, i: number, allGroups: string[]) =>
        allGroups.indexOf(url) === i
    );
</script>

<div class="groupLogosContainer">
  {#each group_urls as url}
    <input
      type="image"
      class="groupBtn"
      src="{url}"
      on:click="{changeActive}"
      alt="groupLogo"
    />
  {/each}
</div>

<style>
  .groupLogosContainer {
    margin: 0 auto;
  }

  .groupBtn {
    height: 80px;
    border-radius: 100%;
    background-color: #ffffff;
    margin: 5px;
    box-shadow: 0 8px #c9c9c9;
    transition: background-color 0.6s ease;
  }

  .groupBtn:hover {
    background-color: #ffb84b;
  }

  .groupBtn:active {
    background-color: #e2941f;
  }
</style>

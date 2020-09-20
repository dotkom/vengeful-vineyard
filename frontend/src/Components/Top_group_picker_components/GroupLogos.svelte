<script lang="ts">
  import users from "../../FakeData/MOCK_DATA.json";
  let currentGroup = "";

  const changeActive = (path : string) => {
    const currentGroup = users.filter((user) => user.group_logo === path);

    console.log(currentGroup[1].group);
    updateGroup(currentGroup[1].group);
    getCurrentGroup();
    return currentGroup[1].group;
  };

  const updateGroup = (newGroup : string) => {
    currentGroup = newGroup;
  };

  let group_urls = users
                  .map((user) => user.group_logo)
                  .filter((url, i, allGroups) => allGroups.indexOf(url) === i);
</script>

<div class="groupLogosContainer">
  {#each group_urls as url}
    <input
      type="image"
      class="groupBtn"
      src={url}
      on:click={changeActive}
      alt="groupLogo"
    >
  {/each}
</div>

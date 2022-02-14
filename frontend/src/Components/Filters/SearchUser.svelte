<script lang="ts">
  import { users } from "../../stores/users";
  import { group } from "../../stores/groups";

  let val = "";

  const filterSearch = (keyword) => {
    keyword = keyword.toLocaleLowerCase();
    users.update((users) =>
      $group.members.filter(
        (user) =>
          user.first_name.toLocaleLowerCase().includes(keyword) ||
          user.last_name.toLocaleLowerCase().includes(keyword)
      )
    );
  };
</script>

<div class="form-control">
  <label class="label">
    <span class="label-text">Finn bruker</span>
  </label>
  <input
    type="text"
    placeholder="Navn"
    class="input input-bordered"
    bind:value="{val}"
    on:input="{() => filterSearch(val)}"
  />
</div>

<style lang="less">
  .label-text {
    color: #eeeeee;
    font-size: 20px;
    float: left;
  }

  .input-bordered {
    background-color: white;
  }
</style>

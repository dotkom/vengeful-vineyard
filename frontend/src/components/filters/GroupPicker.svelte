<script lang="ts">
  import Select from "svelte-select";
  import { accessToken, isAuthenticated } from "@dopry/svelte-oidc";
  import { getOnlineProfile, getMyOnlineGroups } from "../../api";

  function handleSelect(event) {
    console.log(event.detail.value);
  }
</script>

<div class="flex flex-col justify-center m-auto pt-3">
  <label class="label">
    <span class="label-text">Viser straffer fra gruppe</span>
  </label>
  {#if $isAuthenticated}
    {#await getOnlineProfile($accessToken) then value}
      {#await getMyOnlineGroups($accessToken, value.id) then groups}
        <div class="themed">
          <Select
            items="{groups
              .filter(
                (singGroup) => !singGroup.name_short.includes('permissions')
              )
              .map((group) => group.name_short)}"
            value="{groups
              .filter(
                (singGroup) => !singGroup.name_short.includes('permissions')
              )
              .map((group) => group.name_short)[0]}"
            on:select="{handleSelect}"
            isClearable="{false}"
            showIndicator="{true}"
            placeholder="Velg periode"
          />
        </div>
      {/await}
    {/await}
  {/if}
</div>

<style lang="less">
  .label-text {
    color: #eeeeee;
    font-size: 18px;
    float: left;
  }

  .themed {
    --borderRadius: var(--rounded-btn, 0.5rem);
    background: var(--borderFocusColor, none);
    border-color: var(--borderFocusColor, none);
    border: var(--border, none);
    --itemIsActiveColor: black;
    --itemIsActiveBG: #f5f9ff;
  }
</style>

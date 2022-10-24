<script lang="ts">
  import Select from "svelte-select";
  import { accessToken, isAuthenticated } from "@dopry/svelte-oidc";
  import { getMyOnlineGroups } from "../../lib/api";

  function handleSelect(event: CustomEvent<{ value: string }>) {
    console.log(event.detail.value);
  }
</script>

<div class="flex flex-col justify-center m-auto pt-3">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label">
    <span class="label-text">Viser straffer fra gruppe</span>
  </label>
  {#if $isAuthenticated}
    {#await getMyOnlineGroups($accessToken) then groups}
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
  {/if}
</div>

<style lang="postcss">
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

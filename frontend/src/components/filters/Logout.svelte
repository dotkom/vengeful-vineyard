<script lang="ts">
  import {
    OidcContext,
    LogoutButton,
    isAuthenticated,
  } from "@dopry/svelte-oidc";
</script>

<div class="flex m-auto">
  {#if $isAuthenticated}
    <div class="w-full m-auto hover:bg-red-600 rounded-lg">
      <div class="btn bg-red-500 rounded-lg ">
        <LogoutButton>Logg ut</LogoutButton>
      </div>
    </div>
  {/if}
  <!-- </OidcContext> -->
</div>

<style lang="less">
  .btn {
    width: fit-content;
    padding: 0;
  }
</style>

<script lang="ts">
  import VvLogo from "./VvLogo.svelte";
  import Button from "./../Button.svelte";
  import {
    OidcContext,
    LoginButton,
    LogoutButton,
    RefreshTokenButton,
    authError,
    accessToken,
    idToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    userInfo,
  } from "@dopry/svelte-oidc";

  let navElements = [
    { link: "index.html", name: "Hjem" },
    { link: "index2.html", name: "Wall of Shame" },
  ];

  let logIcon = "assets/LogIn.svg";
</script>

<nav class="header">
  <VvLogo />
  <ul
    class="flex flex-row space-x-4 items-center m-0 p-0 align-baseline uppercase"
  >
    {#each navElements as element}
      <li>
        <a
          href="{element.link}"
          class="h-full w-full text-2xl mx-12 hover:bg-primary-750"
          style="color: white"
        >{element.name}</a>
      </li>
    {/each}
  </ul>
  <div class="flex flex-col justify-center items-center">
    <a href="https://vg.no"> <img alt="Login icon" src="{logIcon}" /></a>
    <OidcContext
      issuer="https://online.ntnu.no/openid"
      client_id="219919"
      redirect_uri="http://localhost:3000"
      post_logout_redirect_uri="http://localhost:3000"
      scope="openid profile onlineweb4"
      extraOptions="{{ metadataUrl: 'https://online.ntnu.no/openid/.well-known/openid-configuration', filterProtocolClaims: true, loadUserInfo: true, silent_redirect_uri: 'http://localhost:3000', revokeAccessTokenOnSignout: true }}"
    >
      <!--
  <RefreshTokenButton>RefreshToken</RefreshTokenButton><br />
  <pre>isLoading: {$isLoading}</pre>
  <pre>isAuthenticated: {$isAuthenticated}</pre>
  <pre>authToken: {$accessToken}</pre>
  <pre>idToken: {$idToken}</pre>
  <pre>userInfo: {JSON.stringify($userInfo, null, 2)}</pre>
  <pre>authError: {$authError}</pre>
  -->
      {#if $isAuthenticated}
        <div class="text-white" style="color: white">{$userInfo.name}</div>
        <LogoutButton>Logout</LogoutButton>
      {:else}
        <LoginButton>Login</LoginButton>
      {/if}
    </OidcContext>
  </div>
</nav>

<style lang="postcss">
  .header {
    @apply flex justify-between bg-primary-1000 mb-4 px-24 w-full;
  }
</style>

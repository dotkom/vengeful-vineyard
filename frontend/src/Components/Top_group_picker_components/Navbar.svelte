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
} from '@dopry/svelte-oidc';
import { getOnlineProfile, getMyOnlineGroups } from "../../api";

  let navElements = [
    { link: "index.html", name: "Hjem" },
    { link: "index2.html", name: "Wall of Shame" },
  ];

  let logIcon = "assets/LogIn.svg";

</script>

<nav>
  <VvLogo />
  <ul
    class="navContentWrapper"
  >
    {#each navElements as element}
      <li>
        <a
          href="{element.link}"
          class="navElement"
          style="color: white"
        >{element.name}</a>
      </li>
    {/each}
  </ul>
  <div class="loginSection">
    <a href="https://vg.no"> <img alt="Login icon" src="{logIcon}" /></a>
  <OidcContext
 issuer="https://online.ntnu.no/openid"
 client_id="219919"
 redirect_uri="http://localhost:3000"
 post_logout_redirect_uri="http://localhost:3000"
 scope='openid profile onlineweb4'
 extraOptions={{
  metadataUrl: "https://online.ntnu.no/openid/.well-known/openid-configuration",
  filterProtocolClaims: true,
  loadUserInfo: true,
  silent_redirect_uri: "http://localhost:3000",
  revokeAccessTokenOnSignout: true,
 }}
 >
    {#if $isAuthenticated}
    <div class="text-white" style="color: white">{$userInfo.name}</div>
    <LogoutButton>Logout</LogoutButton>
    {#await getOnlineProfile($accessToken) then value}
      <p>My ID: {value.id}</p>
      {#await getMyOnlineGroups($accessToken, value.id) then value2}
        {#each value2.results as group}
        <p>{group.name_short}</p>
        {/each}
      {/await}
    {/await}
    {:else}
      <LoginButton>Login</LoginButton>
    {/if}
</OidcContext>
  </div>
</nav>

<style lang="postcss">
  nav {
    @apply flex justify-between bg-primary-1000 mb-4 px-24 w-full;
  }

  .navContentWrapper {
    @apply flex flex-row space-x-4 items-center m-0 p-0 align-baseline uppercase;
  }
  .navElement {
    @apply h-full w-full text-2xl mx-12;
  }
  
  .navElement:hover {
    @apply bg-primary-750;
  }

  .loginSection {
    @apply flex flex-col justify-center items-center;
  }

</style>

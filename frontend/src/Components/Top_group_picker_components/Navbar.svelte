<script lang="ts">
  import VvLogo from "./VvLogo.svelte";
  import {
    OidcContext,
    LoginButton,
    LogoutButton,
    accessToken,
    isAuthenticated,
    userInfo,
  } from "@dopry/svelte-oidc";
  import { getOnlineProfile, getMyOnlineGroups } from "../../api";
  import Button from "../Button.svelte";

  let navElements = [
    { link: "index.html", name: "Hjem" },
    { link: "index2.html", name: "Wall of Shame" },
  ];

  let logIcon = "assets/LogIn.svg";
</script>

<nav>
  <VvLogo />
  <ul class="navContentWrapper">
    {#each navElements as element}
      <li>
        <a href="{element.link}" class="navElement" style="color: white"
          >{element.name}</a
        >
      </li>
    {/each}
  </ul>
  <div class="loginSection">
    <img alt="Login icon" src="{logIcon}" />
    <OidcContext
      issuer="https://old.online.ntnu.no/openid"
      client_id="219919"
      redirect_uri="http://localhost:3000"
      post_logout_redirect_uri="http://localhost:3000"
      scope="openid profile onlineweb4"
      extraOptions="{{
        metadataUrl:
          'https://old.online.ntnu.no/openid/.well-known/openid-configuration',
        filterProtocolClaims: true,
        loadUserInfo: true,
        silent_redirect_uri: 'http://localhost:3000',
        revokeAccessTokenOnSignout: true,
      }}"
    >
      {#if $isAuthenticated}
        <div class="text-white" style="color: white">{$userInfo.name}</div>
        <LogoutButton>
          <div class="log_in_out">
            <Button color="danger">Log out</Button>
          </div>
        </LogoutButton>
      {:else}
        <LoginButton>
          <div class="log_in_out">
            <Button color="success">Log in</Button>
          </div>
        </LoginButton>
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

  .log_in_out {
    padding-top: 0.5rem;
  }
</style>

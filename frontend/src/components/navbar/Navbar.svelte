<script lang="ts">
  import VvLogo from "../filters/VvLogo.svelte";
  import {
    OidcContext,
    LoginButton,
    LogoutButton,
    isAuthenticated,
    userInfo,
  } from "@dopry/svelte-oidc";

  let logIcon = "assets/LogIn.svg";
</script>

<nav>
  <div class="loginSection">
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
        <img alt="Login icon" src="{logIcon}" />
        <div class="text-white" style="color: white">{$userInfo.name}</div>
        <div class="bg-red-500 rounded-lg">
          <LogoutButton>Logg ut</LogoutButton>
        </div>
      {:else}
        <div class="bg-yellow-400 rounded-lg">
          <LoginButton>Logg inn</LoginButton>
        </div>
      {/if}
    </OidcContext>
  </div>
</nav>

<style lang="postcss">
  .btn {
    background: red;
  }

  nav {
    @apply flex justify-between mb-4 px-24 w-full;
    background: #093b51;
    border: 1px solid #072e3f;
  }

  .loginSection {
    @apply flex flex-col justify-center items-center;
  }
</style>

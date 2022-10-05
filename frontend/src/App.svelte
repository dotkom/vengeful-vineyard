<script lang="ts">
  import { OidcContext, isAuthenticated } from "@dopry/svelte-oidc";
  import Navbar from "./components/navbar/Navbar.svelte";
  import GroupLogos from "./components/groups/GroupLogos.svelte";
  import Footer from "./components/footer/Footer.svelte";
  import PunishmentGrid from "./components/punishments/PunishmentGrid.svelte";
  import Sidebar from "./components/filters/Sidebar.svelte";
</script>

<link rel="preconnect" href="https://fonts.gstatic.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;400&display=swap"
  rel="stylesheet"
/>
<link rel="preconnect" href="https://fonts.gstatic.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro&display=swap"
  rel="stylesheet"
/>

<div class="content">
  <Navbar />
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
      <div class="body_content">
        <Sidebar />
        <div class="punishments">
          <GroupLogos />
          <PunishmentGrid />
        </div>
      </div>
    {/if}
  </OidcContext>

  <Footer />
</div>

<style lang="less" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  @import "variables.less";
  .body_content {
    @apply flex;
    margin: 0 5em;
  }

  .content {
    background-color: #f7f7f7;
    font-family: "Source Sans Pro", sans-serif;
  }

  h1 {
    @apply uppercase text-center;
    font-family: "Montserrat", sans-serif;
    margin: 20px;
  }
  .punishments {
    @apply w-7/12 mt-4;
    margin-left: auto;
    margin-right: auto;
  }
</style>

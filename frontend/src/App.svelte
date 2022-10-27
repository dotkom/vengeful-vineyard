<script lang="ts">
  import {
    OidcContext,
    isAuthenticated,
    accessToken,
    LoginButton,
  } from "@dopry/svelte-oidc";
  import BodyContent from "./components/BodyContent.svelte";
  import { getGroup, getMyOnlineGroups } from "./lib/api";
  import { Group, OWGroup } from "./lib/types";
  import { group } from "./stores/group";
  import { OWgroups } from "./stores/OWgroups";
  import { punishmentsToFilter } from "./stores/punishmentToFilter";
  import { users } from "./stores/users";

  const localStorageEmpty = (): boolean => {
    return (
      window.localStorage.getItem("group") === "null" ||
      window.localStorage.getItem("users") === "null" ||
      window.localStorage.getItem("punishmentFilters") === "null" ||
      window.localStorage.getItem("OWgroups") === "null"
    );
  };

  const setOWGroups = (groups: OWGroup[]): void => {
    OWgroups.set(groups);
  };

  const setStores = (firstGroup: Group): void => {
    group.set(firstGroup);
    users.set(firstGroup.members);
    punishmentsToFilter.set(firstGroup.punishment_types);
  };
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
      {#if localStorageEmpty()}
        {#await getMyOnlineGroups($accessToken)}
          <h1>LOADING ALL GROUPS</h1>
        {:then groups}
          {#await setOWGroups(groups)}
            <h1>SETTING OW GROUPS</h1>
          {:then}
            {#await getGroup(groups[0].group_id)}
              <h1>LOADING FIRST GROUP</h1>
            {:then firstGroup}
              {#await setStores(firstGroup)}
                <h1>SETTING OTHER STORES</h1>
              {:then}
                <BodyContent />
              {/await}
            {/await}
          {/await}
        {/await}
      {:else}
        <BodyContent />
      {/if}
    {:else}
      <LoginButton>Logg inn</LoginButton>
    {/if}
  </OidcContext>
</div>

<style lang="postcss" global>
  .body_content {
    @apply flex;
    margin: 0;
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

<script lang="ts">
  import Footer from "./footer/Footer.svelte";
  import NewPunishmentBtn from "./newPunishmentMultiple/NewPunishmentBtn.svelte";
  import PunishmentGrid from "./punishments/PunishmentGrid.svelte";
  import Sidebar from "./sidebar/Sidebar.svelte";
  import { OWgroups } from "../stores/OWgroups";
</script>

{#if $OWgroups.length < 1}
  <div class="flex flex-row items-center justify-center m-auto h-full">
    <img src="assets/icons/sad.png" alt="sadface" width="100" />
    <p class="ml-4">
      Kunne ikke finne noen grupper du er medlem i.
      <br />
      Ta kontakt med
      <a class="hover:underline" href="mailto:dotkom@online.ntnu.no">
        Dotkom
      </a>
      om dette er feil.
    </p>
  </div>
{:else}
  <div class="body_content">
    <Sidebar />
    <div class="punishments">
      <NewPunishmentBtn />
      <PunishmentGrid />
      <Footer />
    </div>
  </div>
{/if}

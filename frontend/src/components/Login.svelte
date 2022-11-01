<script lang="ts">
  import { LoginButton } from '@dopry/svelte-oidc'
</script>

<div class="h-screen w-full flex justify-center items-center bg-[#F5F5F5]">
  <div
    class="bg-[#FDFDFF] p-8 flex flex-col justify-center items-center rounded shadow-xl"
  >
    <p class="text-[#333333]">Velkommen til</p>
    <img src="assets/VV-logo.svg" alt="vv logo" width="200" height="80" />
    <p class="text-[#333333] mb-11 mt-2">🎉- Onlines nye vinstraffsystem!🎉</p>
    <div class="bg-green-400 rounded-lg ">
      <LoginButton preserveRoute="true">Logg inn med OW bruker</LoginButton>
    </div>
    <p class="text-[#333333] mt-5 text-xs">
      - Fra
      <a class="hover:underline" href="mailto:dotkom@online.ntnu.no">Dotkom</a>
      med ♥️
    </p>
  </div>
</div>

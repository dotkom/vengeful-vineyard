<script lang="ts">
  import Svelecte, { addFormatter } from "svelecte";
  import { User } from "../../lib/types";
  import { filteredUsers } from "../../stores/users";
  import AddNewPunishment from "../punishments/AddNewPunishment.svelte";

  export let displayNewPunishment: boolean;
  export let setDisplayNewPunishment: (display: boolean) => void;

  let selection: User[];
  let value: User[];

  const myI18n = {
    empty: `Alle brukere er allerede lagt til`,
    nomatch: "Ingen matchende brukere",
  };

  function userRenderer(user: User) {
    return `${user.first_name} ${user.last_name}`;
  }

  addFormatter({
    usersNames: userRenderer,
  });
</script>

<h2>Ny straff</h2>
<Svelecte
  options="{$filteredUsers}"
  multiple
  renderer="usersNames"
  inputId="groupUsers"
  i18n="{myI18n}"
  bind:readSelection="{selection}"
  bind:value
  placeholder="Navn på bruker"
/>

<button
  class=" btn text-white bg-gray-500 hover:bg-gray-600 focus:ring-4
focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center
inline-flex items-center mr-2"
  on:click="{() => setDisplayNewPunishment(!displayNewPunishment)}"
>
  Avbryt
</button>

<AddNewPunishment user="{selection}" />

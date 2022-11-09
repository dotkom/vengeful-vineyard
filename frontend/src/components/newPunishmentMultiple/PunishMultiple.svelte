<script lang="ts">
  /* eslint-disable no-unused-vars */
  import Svelecte, { addFormatter } from 'svelecte'
  import { User } from '../../lib/types'
  import { filteredUsers } from '../../stores/users'
  import AddNewPunishment from '../punishments/AddNewPunishment.svelte'

  export let displayNewPunishment: boolean
  export let setDisplayNewPunishment: (display: boolean) => void

  let selection: User[]
  let value: User[]

  const onGroupChange = (newUsers: User[]) => {
    value = []
  }

  $: onGroupChange($filteredUsers)

  const myI18n = {
    empty: `Alle brukere er allerede lagt til`,
    nomatch: 'Ingen matchende brukere'
  }

  function userRenderer(user: User) {
    return `${user.first_name} ${user.last_name}`
  }

  addFormatter({
    usersNames: userRenderer
  })
</script>

<div class="flex flex-col ml-2 mr-2">
  <h2 class="text-[#5E6282] font-bold text-lg mb-3">Ny straff</h2>
  <Svelecte
    options="{$filteredUsers}"
    multiple
    renderer="usersNames"
    inputId="groupUsers"
    i18n="{myI18n}"
    bind:readSelection="{selection}"
    bind:value
    placeholder="Navn på bruker(e)"
    style="z-index: 100;"
  />
</div>

<AddNewPunishment user="{selection}" />

<button
  class=" text-[#696969] bg-[#DCDCDC] hover:bg-gray-300 font-medium rounded-2xl text-sm  text-center
inline-flex items-center mr-2 ml-2 px-2 py-1"
  on:click="{() => setDisplayNewPunishment(!displayNewPunishment)}"
>
  Ferdig
</button>

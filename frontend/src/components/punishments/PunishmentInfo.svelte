<script lang="ts">
  import {
    deletePunishment,
    getGroupUsers,
    getUser,
    postValidatePunishment
  } from '../../lib/api'
  import type { Punishment, PunishmentType, User } from '../../lib/types'
  import { getLogoUrl, formatGivenTime } from '../../lib/functions'
  import { users } from '../../stores/users'
  import { group } from '../../stores/group'
  import { accessToken } from '@dopry/svelte-oidc'
  import SvelteTooltip from 'svelte-tooltip'
  import AddNewPunishment from './AddNewPunishment.svelte'

  export let user: User | undefined
  let userToPunish: User[] = []
  if (user) {
    userToPunish.push(user)
  }
  export let punishments: Punishment[]
  export let punishmentTypes: PunishmentType[]
  export let totalSum: number | undefined

  let verifyIconPath = '../../assets/checkGreen.svg'

  /**
   * Deletes a punishment from database and removes the item from GUI.
   * Updates total sum displayed
   * @param id punishment's id
   */
  const removePunishment = async (id: number) => {
    if (!user) {
      console.error('User is undefined')
      return
    }
    await deletePunishment(id, $accessToken).then(async () => {
      users.set(await getGroupUsers($group.group_id))
    })

    punishments = user.punishments.filter((p: Punishment) => p.punishment_id !== id)
  }

  const verifyPunishment = async (id: number) => {
    if (!user) {
      // TODO add error msg to user here
      console.error('Error when verifying punishment')
      return
    }
    await postValidatePunishment(id, $accessToken).then(async () => {
      users.set(await getGroupUsers($group.group_id))
    })

    punishments = user.punishments.filter(p => p.punishment_id !== id)
  }
</script>

<div class="punishment_info">
  <AddNewPunishment user="{userToPunish}" />
  {#each punishments as punishment}
    <div class="punishment">
      <div class="reason_wrapper">
        {#if punishment.verified_time}
          {#if punishment.verified_by != null}
            {#await getUser(Number(punishment.verified_by)) then user}
              <p class="text-green-600 break-words break-spaces">
                Verifisert av {user.first_name}
                {user.last_name}
                {formatGivenTime(punishment.verified_time)}
              </p>
            {/await}
          {/if}
        {:else}
          <SvelteTooltip tip="Marker som betalt" bottom color="rgba(117, 191, 148, 0.6)">
            <div
              class="verifyBtn"
              on:click="{() => verifyPunishment(punishment.punishment_id)}"
            >
              <img class="h-7 w-7" src="{verifyIconPath}" alt="Remove punishment" />
            </div>
          </SvelteTooltip>
        {/if}
      </div>

      <div class="col-span-2 border-box">
        <p class="break-words break-spaces">{punishment.reason}</p>
        <p class="break-words break-spaces">
          {#await getUser(Number(punishment.created_by)) then user}
            - Gitt av
            <i>{user.first_name} {user.last_name}</i>
          {/await}
        </p>
      </div>

      <!-- Add a drink icon for each punishment-->
      <div class="punishment_icons">
        {#each Array(punishment.amount) as _, i}
          <img
            class="icon"
            src="{getLogoUrl(punishment.punishment_type_id, punishmentTypes)}"
            alt="punishment"
          />
        {/each}
      </div>
      <div
        class="col-span-2 relative h-full flex justify-center align-middle
        items-center"
      >
        <div class="dropdown dropdown-end absolute z-10 top-0 right-0">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label
            tabindex="0"
            class="badge hover:cursor-pointer border-gray-300 bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block w-5 h-5 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012
                0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
            </svg>
          </label>
          <ul
            tabindex="0"
            class="menu menu-compact dropdown-content shadow bg-white
            rounded-box w-40"
          >
            <button
              on:click="{() => {
                removePunishment(punishment.punishment_id)
              }}"
            >
              Annuler straff
            </button>
          </ul>
        </div>
        <div>{formatGivenTime(punishment.created_time)}</div>
      </div>
    </div>
  {:else}
    <div></div>
  {/each}
  <div class="sum">Total sum: {totalSum}</div>
</div>

<style lang="postcss">
  .punishment {
    @apply grid grid-cols-9 gap-1 bg-white shadow-md h-20;
    border: 0.3px solid #d9d9d9;
    box-sizing: border-box;
    box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
    height: auto;
  }

  .punishment p {
    @apply p-4 text-sm font-sspro;
  }

  .punishment > {
    @apply items-center m-1 p-1;
  }

  .icon {
    @apply h-8 w-8;
    margin: 1px;
  }

  .sum {
    @apply m-4 text-right;
  }

  .verifyBtn {
    @apply float-left self-center;
    min-width: 1.5rem;
  }
  .verifyBtn:hover {
    cursor: pointer;
  }

  .punishment_icons {
    @apply flex justify-center items-center col-span-4;
    min-width: 7em;
    border-right: 1px solid #d9d9d9;
    height: 100%;
  }

  .reason_wrapper {
    @apply flex flex-col m-0 col-start-1 col-end-2 justify-center content-center items-center;
  }

  .break-spaces {
    @apply text-center;
    white-space: break-spaces;
    max-width: 100%;
  }

  .border-box {
    border-right: 1px solid #d9d9d9;
    border-left: 1px solid #d9d9d9;
  }
</style>

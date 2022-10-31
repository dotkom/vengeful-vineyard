<script lang="ts">
  /*eslint-ignore no-unused-vars*/
  import { getGroup, postCustomPunishmentType } from "../../../lib/api";
  import { group } from "../../../stores/group";
  import { CreateCustomPunishment } from "../../../lib/types";
  import { accessToken } from "@dopry/svelte-oidc";
  import { punishmentsToFilter } from "../../../stores/punishmentToFilter";

  export let name: string | null;
  export let displayCreatePunishment: boolean;
  export let setDisplayCreatePunishment: (display: boolean) => void;

  let value: number;
  let logoUrl: string;

  const createCustomPunishment = async () => {
    let newPunishment: CreateCustomPunishment = {
      name: name,
      value: value,
      logo_url: logoUrl,
    };

    await postCustomPunishmentType(
      $group.group_id,
      newPunishment,
      $accessToken
    ).then(async (res) => {
      if(newPunishment.name != null){
      $punishmentsToFilter = [
      ...$punishmentsToFilter,
      {
        name: newPunishment.name,
        logo_url: newPunishment.logo_url,
        value: newPunishment.value,
        punishment_type_id: res.id,
      },
    ];

    await getGroup($group.group_id).then((res) => group.set(res)).then(() => {
      name=null
      value=0
      logoUrl=""
      setDisplayCreatePunishment(!displayCreatePunishment)})
      }
    
    });
  };
</script>

<div class="m-4 px-6 p-5 bg-[#082C5B] w-auto h-auto rounded flex flex-col">
  <p class="label-text m-auto mb-3">Opprett ny straff</p>
  <label class="flex flex-row justify-center items-center m-auto mb-2">
    <span class="mr-2 label-text">Navn:</span>
    <input
      type="text"
      placeholder="Navn på straff"
      class="w-44 border-[#d1d1d1] placeholder-[#D6D6D1]"
      style="
        border-radius: 4px;
        height: 2.4rem;"
      bind:value="{name}"
      required
    />
  </label>
  <label class="flex flex-row justify-center items-center m-auto mb-2">
    <span class="mr-2 label-text">Verdi:</span>
    <input
      type="number"
      placeholder="Verdi på straff"
      class="w-44 border-[#d1d1d1] placeholder-[#D6D6D1]"
      style="
        border-radius: 4px;
        height: 2.4rem;"
      bind:value
      required
    />
  </label>
  <label class="flex flex-row justify-center items-center m-auto mb-4">
    <span class="mr-2 label-text">Bilde url:</span>
    <input
      type="text"
      placeholder="Url til bilde på straff"
      class="w-48 border-[#d1d1d1] placeholder-[#D6D6D1]"
      style="
        border-radius: 4px;
        height: 2.4rem;"
      bind:value="{logoUrl}"
      required
    />
  </label>

  <div class="flex m-auto justify-center items-center flex-col mb-3">
    <p class="label-text mb-2">Forhåndsvisning:</p>
    <img height="40" width="40" src="{logoUrl}" alt="{`${name}`}" />
  </div>

  <div class="flex flex-row justify-evenly">
    <button
      class=" text-[#696969] bg-[#DCDCDC] hover:bg-gray-300 font-medium rounded-2xl text-sm  text-center
inline-flex items-center mr-2 ml-2 px-2 py-1"
      on:click="{() => setDisplayCreatePunishment(!displayCreatePunishment)}"
    >
      Avbryt
    </button>
    <button
      class="text-white bg-green-500 hover:bg-green-600 font-medium rounded-2xl text-sm  text-center
    inline-flex items-center px-2 py-1 disabled:opacity-30 disabled:hover:bg-green-500 w-auto"
      disabled="{name == '' || value == null || logoUrl == '' ? true : false}"
      on:click="{() => createCustomPunishment()}"
    >
      Opprett
    </button>
  </div>
</div>

<style lang="less">
  .label-text {
    color: #eeeeee;
    font-size: 18px;
    float: left;
  }
</style>

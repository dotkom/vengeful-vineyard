<script lang="ts">
  import Svelecte, { addFormatter } from "svelecte";
  import { group } from "../../stores/group";
  import { users } from "../../stores/users";
  import type { User, CreatePunishment, PunishmentType } from "../../lib/types";
  import { getGroupUsers, addPunishmentToUser } from "../../lib/api";

  export let user: User[] | undefined;

  let reason = "";
  let punType: PunishmentType | undefined;
  let amount: number | undefined;
  let value: string | null;

  let displayNoUserError: boolean = false;

  export const clickNewPunishment = async () => {
    if (!user || user.length < 1) {
      console.error("User is undefined");
      displayNoUserError = true;
      return;
    }
    let punishmentType = punType;
    if (!punishmentType || !amount) {
      console.error("Invalid punishment type or amount");
      return;
    }
    let new_punishment: CreatePunishment = {
      punishment_type: punishmentType.punishment_type_id,
      reason: reason,
      amount: amount,
    };

    user.map(
      async (user) =>
        await addPunishmentToUser(
          new_punishment,
          $group.group_id,
          user.user_id
        ).then(async () => {
          users.set(await getGroupUsers($group.group_id));
        })
    );

    reason = "";
    punType = undefined;
    amount = undefined;
    displayNoUserError = false;
    value = null;
  };

  const myI18n = {
    nomatch: "Ingen matchende straffer",
  };

  function colorRenderer(punishment: PunishmentType, isSelected: boolean) {
    if (isSelected) {
      punType = punishment;
    }
    return `<div class="flex flex-row w-fit"><img class="px-0.5" src=${punishment.logo_url}></img><p>${punishment.name}</p></div>
     `;
  }

  addFormatter({
    "pun-blocks": colorRenderer,
  });
</script>

<div class="flex flex-row w-full items-center m-1 p-1 justify-between pb-5">
  <div class="form-control pr-1">
    <input
      type="text"
      placeholder="Begrunnelse"
      class="w-full border-[#d1d1d1] placeholder-[#D6D6D1]"
      style="
    border-radius: 4px;
    height: 2.4rem;"
      bind:value="{reason}"
      required
    />
  </div>
  <div class="themed pr-1 w-[15%]">
    <Svelecte
      options="{$group.punishment_types}"
      i18n="{myI18n}"
      renderer="pun-blocks"
      inputId="punishment"
      bind:value
      placeholder="Straff"
      required
      class="{'svelecte-control w-40'}"
    />
  </div>
  <div class="number-control pr-1">
    <input
      type="number"
      min="1"
      placeholder="Antall"
      class="w-full border-[#d1d1d1] placeholder-[#D6D6D1]"
      style="
    border-radius: 4px;
    height: 2.4rem;"
      bind:value="{amount}"
      required
    />
  </div>
  <button
    class="text-white bg-green-500 hover:bg-green-600 focus:ring-4
    focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center
    inline-flex items-center mr-2 disabled:opacity-30 disabled:hover:bg-green-500 w-auto"
    style="min-width: fit-content;"
    disabled="{punType == undefined || amount == undefined || reason == ''
      ? true
      : false}"
    on:click="{clickNewPunishment}"
  >
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <rect width="15" height="15" fill="url(#pattern0)"></rect>
      <defs>
        <pattern
          id="pattern0"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlink:href="#image0_1078_553" transform="scale(0.0104167)"></use>
        </pattern>
        <image
          id="image0_1078_553"
          width="96"
          height="96"
          xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAABmJLR0QA/wD/AP+gvaeTAAAEEklEQVR4nO3dv48VVRjG8e+7kEiiRiVBoxQKxBhCoS4xISRUSrLIWpn4ozBROzv/DKSys4NyFWmUBDERlMZYaNRCMFGjFmjUsK6uhbDLPhYzG8Us3DNz5uSdO/N+EgrCmXffe56dufeemWEghBBCCCGEMDbm3UBbkmaAe+q//mJma579jIKkWUlHJX0taVX/WpF0UdJrkh717nNwJO2UdFLSmiZbk3RC0g7vvgdB0kFJiwkT/3+Lkp7w7n+qSZqvDy9trUg67P06ppKkPZL+zJj8dX9I2u39eqaOpA87mPx1571fz1SRdLjDyV93yPt1bWTGu4EbeLlAzZcK1MzWuy9ikrYAvwG3dVx6GdhmZlc6rpulj3vAg3Q/+QC3A7sK1M3SxwDuLVh7e8HarfQxgDsL1r6rYO1W+hhAyfel3r3n9TGAUYkAnEUAziIAZxGAswjAWQTgLAJwFgE4iwCcRQDOIgBnEYCzCMDZ5i6K1KcRdwH3kb+evy+/oxvXlpR7DekS8BPwnZn9ndtQ1vq4pHngRWAOuDW3mSnzF3AGOG5mp9sWaRWApD3AG8CBtj94YM4Dr5jZxaYbNg5A0hzwJnBH020Hbhl4wczeabJRowAkHQRO09F7xwCtAnNmdjZ1g+QAJO0EPqPsSfMhWAT2mtkPKYObfAw9Skx+iq3AkdTBSXuApFng09TxAQGzZvbFpIGpe8DzxOQ3YcBzKQNTA5hv38toPZUyaOJvtaRNwBVgU25HI7MKbDGzazcblLIH3E1MfhubgW2TBqUEoPxeRmvi3KUcgmaoDkHx5auZFapD0E0X/ybuAXWBb7vqakS+Sbl7P/VT0KnMZsbo3ZRBqQEsEO8FTYhqwXKipADM7HPgZE5HI7NgZl+mDGyyGLeDajlia9uuRuIy1WLcjymDkxfjzOx74FmqLxhhY6vAM6mTDw1PypvZB1RfsZcaNjYGy8DTZnauyUaNr4owszPAfuCjptsO2DngMTNL+uTzX7kn5Q9R3YE+R3Uf7pgsU52UP1b/UrbSyRKzpFuoLkvZTv5Jm/3Aq9lNbex14OPMGkvAJarLUrLvuu9keaFu5EL9J0u99FHKJ2b2dsH6jcWVcc4iAGcRgLMIwFkE4CwCcBYBOIsAnEUAziIAZxGAswjAWQTgLAJw1scASl7+0rtLa/oYwO8Fay8WrN1KHwP4uWDtSwVrt9K7u17iP+92Vt/+/36B0u/1bfKhhwHUjhWoebxAzeGSdLbDp2fENUxNSdqt6gE8uZYkPeT9eqaSpCeV/xirXj47ZmpIOiDp1xaTf1nS4979D4KkByS9pfRHGS5Iut+778GR9IikI5Iu6PpD01VJX9X/9rB3n0307otYKknG9Y+z7d06TwghhBBCCCFs5B+WwOW+P8mrGQAAAABJRU5ErkJggg=="
        ></image>
      </defs>
    </svg>
    Legg til
  </button>
</div>

{#if displayNoUserError}
  <h4
    class="text-red-600"
    style="
  margin-bottom: 0.5rem;
  margin-left: 1rem;
  font-style: italic;
  margin-top: -1rem;
"
  >
    Velg bruker(e) som skal gis straff.
  </h4>
{/if}

<style lang="postcss">
  .input-bordered {
    background-color: white;
  }

  .themed {
    --borderRadius: var(--rounded-btn, 0.5rem);
    background: var(--borderFocusColor, none);
    border-color: var(--borderFocusColor, none);
    border: var(--border, none);
    --itemIsActiveColor: black;
    --itemIsActiveBG: #f5f9ff;
  }

  .form-control {
    width: 100%;
  }

  .number-control {
    width: 15%;
  }
</style>

<script lang="ts">
  import Select from "svelte-select";
  import "flowbite";
  import "@themesberg/flowbite";
  import { onlyShowAfterDate, onlyShowBeforeDate } from "../../../stores/users";
  import Flatpickr from "svelte-flatpickr";

  const items = ["alle tider", "i dag", "siste uke", "siste måned"];

  let value: string = "alle tider";

  let dateToFilterBy: Date = new Date(1560807962);
  let noLaterThan: Date = new Date();

  let startDate;
  let endDate;

  console.log(startDate);

  $: onlyShowAfterDate.set(dateToFilterBy);
  $: onlyShowBeforeDate.set(noLaterThan);

  let flatpickr;
  let date = null;

  function handleSelect(event) {
    value = event.detail.value;
    date = null;
    noLaterThan = new Date();
    if (event.detail.value == "alle tider") {
      var today = new Date();
      dateToFilterBy = new Date(
        today.getFullYear() - 5,
        today.getMonth(),
        today.getDate()
      );
    } else if (event.detail.value == "i dag") {
      dateToFilterBy = new Date();
    } else if (event.detail.value == "siste uke") {
      var today = new Date();
      dateToFilterBy = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 7
      );
    } else {
      var today = new Date();
      dateToFilterBy = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate()
      );
    }
  }

  const flatpickrOptions = {
    mode: "range",
    element: "#my-picker",
    enableTime: false,
    altInput: true,
    wrap: true,
    altFormat: "F j, Y",
    dateFormat: "Y-m-d",

    onClose: function (selectedDates, dateStr, instance) {
      dateToFilterBy = new Date(selectedDates[0]);
      noLaterThan = new Date(selectedDates[1]);
      value = null;
    },
    onOpen: function () {
      console.log("opened");
    },
  };
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css"
  />
  <link
    rel="stylesheet"
    type="text/css"
    href="https://npmcdn.com/flatpickr/dist/themes/confetti.css"
  />
</svelte:head>

<div class="flex flex-row justify-center ">
  <label class="label">
    <span class="label-text">Vis straffer fra</span>
  </label>
  <div class="themed" style="width: 55%;">
    <Select
      items="{items}"
      value="{value}"
      on:select="{handleSelect}"
      isClearable="{false}"
      showIndicator="{true}"
      placeholder="Velg periode"
    />
  </div>
</div>

<div class="flex flex-row justify-center mt-6">
  <Flatpickr
    options="{flatpickrOptions}"
    bind:value="{date}"
    element="#my-picker"
    bind:flatpickr
  >
    <div class="mb-5 w-80 ">
      <label for="datepicker" class="mb-1 text-[#eeeeee] block text-[20px]">
        Vis straffer i tidsrom
      </label>
      <div class="flatpickr relative" id="my-picker">
        <input
          type="text"
          placeholder="Velg datoer"
          data-input
          class="w-full pl-4 pr-10 py-3 leading-none rounded-lg shadow-sm
          focus:outline-none focus:shadow-outline text-black font-medium bg-white"
        />

        <div class="absolute top-0 right-0 px-3 py-2">
          <svg
            on:click="{() => {
              if (flatpickr) {
                flatpickr.open();
              }
            }}"
            class="h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0
              00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
      </div>
    </div>
  </Flatpickr>
</div>

<style lang="less">
  .label-text {
    color: #eeeeee;
    font-size: 20px;
    float: left;
    padding-right: 1rem;
  }

  .themed {
    --borderRadius: var(--rounded-btn, 0.5rem);
    // --background: var(--itemIsActiveBG, white);
    background: var(--borderFocusColor, none);
    border-color: var(--borderFocusColor, none);
    border: var(--border, none);

    // --borderFocusColor: white;
    // --borderHoverColor: white;
    // --border: none;
    --itemIsActiveColor: black;
    // background: var(--itemIsActiveBG, white);
    --itemIsActiveBG: #f5f9ff;
  }

  //   .themed:active {
  //       background
  //   }
</style>

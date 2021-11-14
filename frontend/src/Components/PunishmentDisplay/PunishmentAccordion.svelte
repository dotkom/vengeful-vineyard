<script lang="ts">
    export let name: string;
    export let punishments: string;
    export let date: string;
    export let open: boolean = false;

    let height: number = 0;
  
    const toggleAccordion = () => {
      open = !open;
      open ? (height = 3000) : (height = 0);
    };
  </script>

<div class="accordion_container">
    <div
      class="accordion"
      on:click="{toggleAccordion}"
    >
      <div class="accordion_title">
        <div>{name}</div>
        <slot name="title" />
        <div>{punishments}</div>
        <slot name="punishments"/>
        <div>{date}</div>
        <slot date="date" />
      </div>
    </div>
    <div class="accordion_content" style="max-height: {height}px">
      <div class="accordion__text">
        <slot name="content" />
      </div>
    </div>
  </div>

<style lang="less">
    .box_shadow {
        -webkit-box-shadow: 0px 4px 8px -1px rgba(0, 0, 0, 0.75);
        -moz-box-shadow: 0px 4px 8px -1px rgba(0, 0, 0, 0.75);
        box-shadow: 0px 4px 8px -1px rgba(0, 0, 0, 0.75);
    
    }
    .accordion_container{
      @apply w-full;
      .box_shadow;
    }

    .accordion > {
      @apply mx-8;
    }

    .accordion{
        @apply w-full text-gray-500;
        font-family: "Montserrat", sans-serif;
        cursor: pointer;
    }

    .accordion_title{
        @apply flex flex-row justify-between w-full;
    }

    .accordion_content{
        @apply flex flex-col overflow-hidden border-none cursor-auto;

    }

</style>
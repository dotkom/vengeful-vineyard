<script lang="ts">
  export let title: string;
  export let color: string = "#004372";
  export let open: boolean = false;
  let height: number = 0;

  const toggleAccordion = () => {
    open = !open;
    open ? (height = 3000) : (height = 0);
  };
</script>

<div class="accordion__section">
  <div
    class="accordion"
    style="background-color: {color}"
    on:click="{toggleAccordion}"
  >
    <div class="accordion__title">
      <p>{title}</p>
      <slot name="title" />
    </div>
  </div>
  <div class="accordion__content" style="max-height: {height}px">
    <div class="accordion__text">
      <slot name="content" />
    </div>
  </div>
</div>

<style lang="less">
  @import "../../variables.less";
  .accordion__section {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  /* Styles the buttons that are used to open and close the accordion panel */
  .accordion {
    width: 100%;
    height: 50px;
    padding: 5px;
    color: white;
    cursor: pointer;
    font-family: "Montserrat", sans-serif;
    display: flex;
    align-items: center;
    border: none;
    outline: none;
    margin-bottom: 2px;
    transition: background-color 0.2s ease;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 6px;
  }

  /* Adds a background color to the button if it is clicked on and when you move the mouse over it */
  .accordion:hover {
    background-color: @primaryLighten15;
  }

  /* Style the accordion content title */
  .accordion__title {
    cursor: auto;
    padding: 15px;
    font-family: verdana;
    font-size: 14px;
  }

  /* Style the accordion chevron icon */
  /*
  .accordion__icon {
    margin-left: auto;
    transition: transform 0.6s ease;
  }*/

  /* Style to rotate icon when state is active */
  /*
  .rotate {
    transform: rotate(90deg);
  }*/

  /* Style the accordion content panel. Note: hidden by default */
  .accordion__content {
    background-color: @white;
    overflow: hidden;
    transition: max-height 0.6s ease;
    display: flex;
    flex-flow: column;
    cursor: auto;
    border: none;
  }

  .accordion__text {
    margin: 10px;
    font-family: verdana;
    font-size: 14px;
    vertical-align: middle;
  }
</style>

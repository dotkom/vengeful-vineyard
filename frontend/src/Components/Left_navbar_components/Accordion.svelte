<script lang="ts">
  export let title;
  let open : boolean = false;

  const toggleAccordion = () => {
    open = !open;
  };
</script>

<div class="accordion__section">
  <div class:open={open} on:click={toggleAccordion}>
    {title}
  </div>
  <div class="accordion__content" >
    <div class="accordion__text" class:hide={!open}>
    <slot></slot>
  </div>
  </div>
</div>

<style>
  .open {
    color: #0f2d5c;
    display: inline;
  }
  .hide {
    display: none;
  }
</style>

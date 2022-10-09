<script lang="ts">
  export let active: boolean = true;

  const toggleModal = (): void => {
    active = !active;
  };
</script>

{#if active}
  <div class="modal" on:click|self="{toggleModal}">
    <div class="modal_content">
      <slot />
    </div>
  </div>
{/if}

<style lang="less">
  .modal {
    position: fixed;
    z-index: 1; /* Decides the stack order */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    background-color: rgba(0, 0, 0, 0.7);
  }
  .modal_content {
    background-color: white;
    width: 50%;
    margin: 15% auto; /* 15% from the top and centered*/
    padding: 20px;
    border-radius: 5px; /* Rounded edges */
    min-height: 150px;
  }
</style>

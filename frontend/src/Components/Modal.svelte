<script lang="ts">
  export let showModal = true;

  const hideModal = () => {
    showModal = false;
  };
</script>

{#if showModal}
  <div class="modal" on:click|self="{hideModal}">
    <div class="modal_content">
      <slot />
    </div>
  </div>
{/if}

<style lang="less">
  .modal {
    position: fixed;
    z-index: 1; /* Decides the stack order */
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    background-color: rgba(224, 211, 211, 0.541);
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

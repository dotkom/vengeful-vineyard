<script lang="ts">

    export let logoUrl = "";
    export let name = "";
  
  </script>
  
  <button 
    class="groupBtn" 
    on:click={() => console.log("Clickd")}>
      <svg width="30" height="28" viewBox="0 0 30 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.2189 11.9844H26.841C28.1101 11.9844 29.1269 12.9825 29.1269 14.1986C29.1269 15.4146 28.1101 16.4127 26.841 16.4127H18.2189C17.8076 16.4127 17.4618 16.7386 17.4618 17.1556V25.5338C17.4618 26.7498 16.445 27.748 15.1759 27.748C13.9067 27.748 12.89 26.7498 12.89 25.5338V17.1556C12.89 16.7386 12.5441 16.4127 12.1328 16.4127H3.51075C2.24157 16.4127 1.22485 15.4146 1.22485 14.1986C1.22485 12.9825 2.24157 11.9844 3.51075 11.9844H12.1328C12.5441 11.9844 12.89 11.6585 12.89 11.2416V2.86335C12.89 1.6473 13.9067 0.64917 15.1759 0.64917C16.445 0.64917 17.4618 1.6473 17.4618 2.86335V11.2416C17.4618 11.6585 17.8076 11.9844 18.2189 11.9844Z" fill="#FBBF24" stroke="#EA9819" stroke-width="0.5"/>
    </svg>
  </button>
  
  <style lang="less">
    @import "../../variables.less";
    .groupBtn {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 80px;
      width: 80px;
      border-radius: 100%;
      background-color: @white;
      padding: 10px;
    vertical-align: top;
    box-shadow: 2px 1px 2px gray;
    margin: 4px 10px 4px 10px;
    border: none;
    outline: none;

    }
  
    .groupBtn:hover {
      background-color: @secondary;
    }
  
    .groupBtn:active {
      box-shadow: 0 0 0 white;
    margin: 6px 10px 2px 10px;
    border: none;
    outline: none;
    }
  </style>
  
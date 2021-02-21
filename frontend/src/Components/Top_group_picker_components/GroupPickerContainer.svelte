<script lang="ts">
  import VvLogo from "./VvLogo.svelte";
  import GroupStore from "../../stores/groups";
  import { onMount } from "svelte";

  onMount(async () => {
    const res = await fetch("http://localhost:8080/groups");
    const json = await res.json();
    $GroupStore = { currentGroup: json[0].name, groups: json };
  });
</script>

<header class="group_picker_container">
  <VvLogo />
  <div class="navbar-elements">
    <a href="index.html" class="home">Home</a>
    <a href="index.html" class="home">Wall of shame</a>
  </div>
  <div class="log-in">
    <button class="log-in-button">
      <img src="assets/LogIn.svg" alt="login icon" width="250" height="100" />
    </button>
    <div class="navbar-elements">username</div>
  </div>
</header>

<style lang="less">
  @import "../../variables.less";

  header {
    position: relative;
    background-color: @primary;
    margin-bottom: 20px;
  }
  a {
    text-decoration: none;
    color: inherit;
    font-size: 15px;
    padding: 10px;
    margin: 0 5px;
    transition: opacity 0.2s;
  }
  .group_picker_container {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
    padding: 10px 50px 10px;
  }
  .navbar-elements {
    display: flex;
    text-transform: uppercase;
    color: #fff;
    margin: 0px;
    padding: 0px;
    border: 0px;
    font: inherit;
    vertical-align: baseline;
    padding-top: 5px;
  }

  .log-in {
    position: relative;
    display: flex;
    flex-direction: row;
    margin: -10px 20px -10px 0;
    flex: 0 0 auto;
  }
  .log-in-button {
    width: 50px;
    height: 100%;
    background-color: #fff1;
    position: relative;
    cursor: pointer;
  }

  button {
    appearance: auto;
    border: none;
    -webkit-writing-mode: horizontal-tb !important;
    text-rendering: auto;
    color: -internal-light-dark(black, white);
    letter-spacing: normal;
    word-spacing: normal;
    text-transform: none;
    text-indent: 0px;
    text-shadow: none;
    display: inline-block;
    text-align: center;
    align-items: flex-start;
  }
  img {
    width: 50%;
    height: 50%;
  }
</style>

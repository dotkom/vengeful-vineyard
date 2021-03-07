<script lang="ts">
  import GroupStore from "../../stores/groups";
</script>

<div class="sortNav">
  <div class="committeeName">
    <h2 class="groupTitle">{$GroupStore.currentGroup}</h2>
    <img src="assets/Dotkom.svg" alt="group logo" width="115" height="150" />
  </div>
  <div class="sidebar-btn">
    <p>Bytt gruppe</p>
  </div>
  <div class="sidebar-btn" id="sort">
    <p>Sorter etter</p>
  </div>
  <div class="dummy-accordion">
    <p>RADIO BUTTONS GO</p>
  </div>
  <div class="sidebar-btn">
    <p>Mine straffer</p>
  </div>
  <div class="sidebar-btn">
    <p>Legg til straff</p>
  </div>
  <div class="sidebar-btn">
    <p>Legg til flere typer straffer</p>
  </div>
  <div class="goBack">
    <img src="assets/arrow.svg" alt="group logo" width="40" height="38" />
    <p>Tilbake til online.ntnu.no</p>
  </div>
</div>

<style lang="less">
  @import "../../variables.less";
  .sortNav {
    width: 20%;
    background-color: @primary;
    font-family: "Montserrat", sans-serif;
  }

  .committeeName {
    margin-top: 10px;
    background-color: @primary;
    color: white;
    width: 100%;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }

  img {
    margin-left: auto;
    margin-right: auto;
  }
  h2 {
    font-size: 25px;
    margin-bottom: 5px;
    text-align: center;
  }
  .sidebar-btn {
    display: flex;
    background-color: @primaryDarken15;
    height: 60px;
    color: @white;
  }
  .sidebar-btn > p {
    font-size: 15px;
    margin-top: auto;
    margin-bottom: auto;
    margin-left: 15px;
  }
  #sort {
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  }
  .dummy-accordion {
    background-color: @white;
    height: 200px;
  }
  .goBack {
    position: relative;
    font-size: 10px;
    display: flex;
    flex-direction: row;
    height: 100px;
    text-align: center;
  }
  .goBack > p {
    margin-top: auto;
    margin-bottom: auto;
  }

  .goBack > img {
    margin-top: auto;
    margin-bottom: auto;
  }
</style>

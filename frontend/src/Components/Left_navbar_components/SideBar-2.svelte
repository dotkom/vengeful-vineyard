<script lang="ts">
  import GroupStore from "../../stores/groups";
  import Button from "../Button.svelte";
  import Accordion from "./Accordion.svelte";
  import AccordionContent from "./AccordionContent.svelte";
</script>

<link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;400&display=swap"
  rel="stylesheet"
/>

<div class="sortNav">
  <div class="committeeName">
    <h2 class="groupTitle">{$GroupStore.currentGroup}</h2>
  </div>
  <Accordion title="Sorter etter (nåværende)">
    <div slot="content" class="accordion__content">
      <input
        type="radio"
        id="mostPunished"
        name="punishments"
        value="mostPunished"
      />
      <label for="mostPunished">Mest straffet</label><br />
      <input
        type="radio"
        id="recentlyPunished"
        name="punishments"
        value="recentlyPunished"
      />
      <label for="recentlyPunished">Nylig straffet</label><br />
      <input
        type="radio"
        id="punishedByMe"
        name="punishments"
        value="punishedByMe"
      />
      <label for="punishedByMe">Straffer gitt av meg</label><br />
    </div>
  </Accordion>
  <Accordion title="Sorter etter (all time)">
    <AccordionContent />
  </Accordion>
  <div class="sidebar-btn">
    <p>Mine straffer</p>
  </div>
  <div class="sidebar-btn">
    <p>Legg til straff</p>
  </div>
  <div class="sidebar-btn">
    <p>Legg til flere typer straffer</p>
  </div>
</div>

<style lang="less">
  @import "../../variables.less";
  .sortNav {
    width: 20%;
    background-color: @primary;
    font-family: "Montserrat", sans-serif;
    border-radius: 6px;
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
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

  h2 {
    font-size: 25px;
    margin-bottom: 5px;
    text-align: center;
  }
  .sidebar-btn {
    display: flex;
    background-color: @primary;
    height: 60px;
    color: @white;
    border-radius: 6px;
    filter: drop-shadow(4px 4px 4px rgba(0, 0, 0, 0.25));
  }
  .sidebar-btn > p {
    font-size: 15px;
    margin-top: auto;
    margin-bottom: auto;
    margin-left: 15px;
  }
</style>

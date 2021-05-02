<script lang="ts">
  import GroupStore from "../../stores/groups";
  //import Button from "../Button.svelte";
  import Accordion from "./Accordion.svelte";
  //import AccordionContent from "./AccordionContent.svelte";

  //let sortOptions = ["Most Punished", "Recently Punished", "Punished By Me"];
</script>

<link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;400&display=swap"
  rel="stylesheet"
/>

<div class="bg-primary-500 sortNav block justify-items-center">
  <div class="flex flex-col text-white">
    <h2 class="groupTitle text-white text-center">
      {$GroupStore.currentGroup}
    </h2>
  </div>
  <div class="mt-2 container">
    <Accordion title="Sorter etter (nåværende)" open="{true}">
      <div slot="content" class="accordion__content">
        <div>
          <label for="mostPunished">
            <input
              class="form-radio checked text-primary-500 shadow-inner bg-grey"
              type="radio"
              id="mostPunished"
              name="punishments"
              value="mostPunished"
            />
            Mest Straffet
          </label>
        </div>
        <div>
          <label for="recentlyPunished"><br />
            <input
              class="form-radio text-primary-500 shadow-inner bg-grey"
              type="radio"
              id="recentlyPunished"
              name="punishments"
              value="recentlyPunished"
            />
            Nylig straffet</label>
        </div>
        <div>
          <label for="punishedByMe"><br />
            <input
              class="form-radio text-primary-500 shadow-inner bg-grey"
              type="radio"
              id="punishedByMe"
              name="punishments"
              value="punishedByMe"
            />
            Straffer gitt av meg
          </label>
        </div>
      </div>
    </Accordion>
    <Accordion title="Sorter etter (all time)">
      <div slot="content" class="accordion__content">
        <div>
          <label for="mostPunishedAllTime">
            <input
              class="form-radio text-primary-500 shadow-inner bg-grey"
              type="radio"
              id="mostPunishedAllTime"
              name="punishments"
              value="mostPunished"
            />
            Mest Straffet
          </label>
        </div>
        <div>
          <label for="recentlyPunishedAllTime"><br />
            <input
              class="form-radio text-primary-500 shadow-inner bg-grey"
              type="radio"
              id="recentlyPunishedAllTime"
              name="punishments"
              value="recentlyPunished"
            />
            Nylig straffet</label>
        </div>
        <div>
          <label for="punishedByMeAllTime"><br />
            <input
              class="form-radio text-primary-500 shadow-inner bg-grey"
              type="radio"
              id="punishedByMeAllTime"
              name="punishments"
              value="punishedByMe"
            />
            Straffer gitt av meg
          </label>
        </div>
      </div>
    </Accordion>
  </div>
  <div class="sidebar-btn bg-primary-1000">
    <p>Mine straffer</p>
  </div>
  <div class="sidebar-btn bg-primary-1000">
    <p>Legg til straff</p>
  </div>
  <div class="sidebar-btn bg-primary-1000">
    <p>Legg til flere typer straffer</p>
  </div>
</div>

<style lang="less">
  @import "../../variables.less";
  .sortNav {
    width: 20%;
    font-family: "Montserrat", sans-serif;
    border-radius: 6px;
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  }

  .committeeName {
    margin-top: 10px;
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
    height: 60px;
    color: @white;
    border-radius: 6px;
    filter: drop-shadow(4px 4px 4px rgba(0, 0, 0, 0.25));
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  }
  .sidebar-btn > p {
    font-size: 15px;
    margin-top: auto;
    margin-bottom: auto;
    margin-left: 15px;
  }
</style>

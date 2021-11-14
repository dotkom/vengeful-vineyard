<script lang="ts">
  import Modal, { getModal } from "./Modal.svelte";
  import { postGroup } from "../../api";

  let modalTitle = "Create new group";

  let groupName: string;
  let groupUsers: string[] = [];
  let groupUser: string;
  let groupRules: string;

  const validate = () => {
    // Creates group with name and rules, however right now name is the unique identifier lmao
    postGroup(groupName, groupRules);
    closeModal();
  };

  const closeModal = () => {
    clearFields();
    getModal().close();
  };

  const clearFields = () => {
    groupName = "";
    groupUsers = [];
    groupRules = "";
  };

  //Not being used in post rn
  const addUserToGroup = (userEmail: string) => {
    console.log(userEmail);
    if (userEmail != undefined) {
      groupUsers = [...groupUsers, userEmail];
      console.log(groupUsers);
    }

    groupUser = undefined;
  };

  const removeUser = (userEmail: string) => {
    groupUsers = groupUsers.filter(function (user) {
      return user !== userEmail;
    });
  };
</script>

<button id="addGroupBtn" on:click="{() => getModal().open()}">
  <svg
    width="30"
    height="28"
    viewBox="0 0 30 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18.2189 11.9844H26.841C28.1101 11.9844 29.1269 12.9825 29.1269 14.1986C29.1269 15.4146 28.1101 16.4127 26.841 16.4127H18.2189C17.8076 16.4127 17.4618 16.7386 17.4618 17.1556V25.5338C17.4618 26.7498 16.445 27.748 15.1759 27.748C13.9067 27.748 12.89 26.7498 12.89 25.5338V17.1556C12.89 16.7386 12.5441 16.4127 12.1328 16.4127H3.51075C2.24157 16.4127 1.22485 15.4146 1.22485 14.1986C1.22485 12.9825 2.24157 11.9844 3.51075 11.9844H12.1328C12.5441 11.9844 12.89 11.6585 12.89 11.2416V2.86335C12.89 1.6473 13.9067 0.64917 15.1759 0.64917C16.445 0.64917 17.4618 1.6473 17.4618 2.86335V11.2416C17.4618 11.6585 17.8076 11.9844 18.2189 11.9844Z"
      fill="#FBBF24"
      stroke="#EA9819"
      stroke-width="0.5"></path>
  </svg>
</button>

<Modal>
  <h1>{modalTitle}</h1>

  <form on:submit|preventDefault="{validate}">
    <input
      class="nameInput"
      type="text"
      bind:value="{groupName}"
      placeholder="Group name"
    />

    <h5>Group rules url:</h5>
    <input
      type="text"
      bind:value="{groupRules}"
      placeholder="Group rules url"
    />

    <h4>Add users:</h4>
    <div class="addUserContainer">
      <input type="text" bind:value="{groupUser}" placeholder="User email" />

      <button
        type="button"
        class="modalBtn"
        id="addUserInput"
        on:click="{() => addUserToGroup(groupUser)}"
      >
        Invite user to group
      </button>
    </div>

    <div class="invitedUsers">
      {#each groupUsers as user}
        <div class="addedUser">
          <h5 style="padding-right: 0.5rem">{user}</h5>

          <img
            width="24px"
            height="auto"
            alt="Red X"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Red_X.svg/64px-Red_X.svg.png"
            on:click="{() => removeUser(user)}"
            style="cursor: pointer;"
          />
        </div>
      {/each}
    </div>

    <button
      style="background-color: #4BB543; box-shadow: 2px 1px 2px #3a8d34;"
      class="modalBtn"
      type="submit"
    >
      Create group
    </button>
  </form>

  <button
    style="background-color: #cc0000; box-shadow: 2px 1px 2px #990f0f;"
    class="modalBtn"
    on:click="{closeModal}"
  >
    Cancel
  </button>
</Modal>

<style lang="less">
  @import "../../variables.less";

  .nameInput {
    height: 3rem;
    margin-bottom: 1rem;
  }

  button {
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

  button:active {
    box-shadow: 0 0 0 white;
    margin: 6px 10px 2px 10px;
    border: none;
    outline: none;
  }

  #addGroupBtn:hover {
    background-color: @secondary;
  }

  .modalBtn {
    color: @white;
    background-color: @secondary;
    box-shadow: 2px 1px 2px #c79821;
    border-radius: 3px;
    width: auto;
    height: auto;
  }

  .addUserContainer {
    display: flex;
    flex-direction: row;
    margin-bottom: 0.5rem;
  }

  .invitedUsers  {
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-height: 10rem;
    overflow: scroll;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
    margin-bottom: 3rem;
  }

  .addedUser {
    display: flex;
    flex-direction: row;
    justify-content: center;
    text-align: center;
    margin-bottom: 0.5rem;
  }

  h4 {
    margin-top: 2rem;
  }

  form {
    display: flex;
    flex-direction: column;
  }

  input,
  textarea {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px;
  }

  textarea {
    height: 6rem;
    margin-bottom: 4rem;
  }
</style>

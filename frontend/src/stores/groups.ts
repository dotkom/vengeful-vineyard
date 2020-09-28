import { writable } from "svelte/store";

const GroupStore = writable({ currentGroup: "", groups: [] });
export default GroupStore;

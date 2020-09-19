import { useState, useEffect } from "react";

const listeners = new Set();

let globalState = {
  name: null,
  group: null,
  ol_straffer: null,
  vin_straffer: null,
  sprit_straffer: null,
};

const useGlobalState = () => {
  const [state, setState] = useState(globalState);
  useEffect(() => {
    const listener = () => {
      setState(globalState);
    };
    listeners.add(listener);
    listener(); // in case it's already changed
    return () => listeners.delete(listener); // cleanup
  }, []);
  return [state, setGlobalState];
};

const setGlobalState = (nextGlobalState) => {
  globalState = nextGlobalState;
  listeners.forEach((listener) => listener());
};

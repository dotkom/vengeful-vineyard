import { Item } from "./Item";

export const Tabbar = () => (
  <nav className="mx-4">
    <ul className="flex gap-4">
      <Item text="Dotkom" selected />
      <Item text="Wall of Shame" />
    </ul>
  </nav>
);

import { Item } from "./Item";

interface TabbarProps {
  selectedTabIndex: number;
  setSelectedTabIndex: React.Dispatch<React.SetStateAction<number>>;
}

const mockData = [
  { index: 0, text: "Dotkom" },
  { index: 1, text: "Wall of Shame" },
];

export const Tabbar = ({
  selectedTabIndex,
  setSelectedTabIndex,
}: TabbarProps) => (
  <nav className="mx-4 max-w-5xl md:m-auto md:px-8">
    <ul className="flex gap-4">
      {mockData.map((item) => (
        <Item
          key={item.index}
          text={item.text}
          index={item.index}
          selected={selectedTabIndex === item.index}
          setSelectedTabIndex={setSelectedTabIndex}
        />
      ))}
    </ul>
  </nav>
);

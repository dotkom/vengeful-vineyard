interface ItemProps {
  text: string;
  index: number;
  selected?: boolean;
  setSelectedTabIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const Item = ({
  text,
  index,
  selected = false,
  setSelectedTabIndex,
}: ItemProps) => (
  <li
    className={`${
      selected
        ? "text-white border-b-4 border-b-white"
        : "text-slate-300 hover:text-white"
    } font-medium cursor-pointer`}
    onClick={() => setSelectedTabIndex(index)}
  >
    {text}
  </li>
);

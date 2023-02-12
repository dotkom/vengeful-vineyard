interface ButtonProps {
  label: string;
  clickHandler: () => void;
}

export const Button = ({ label, clickHandler }: ButtonProps) => (
  <button
    onClick={clickHandler}
    className="bg-orange-800 hover:bg-orange-900 text-white px-4 py-2 rounded w-full"
  >
    {label}
  </button>
);

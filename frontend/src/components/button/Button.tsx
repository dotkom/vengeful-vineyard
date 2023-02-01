interface ButtonProps {
  label: string;
  clickHandler: () => void;
}

export const Button = ({ label, clickHandler }: ButtonProps) => (
  <button
    onClick={clickHandler}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
  >
    {label}
  </button>
);

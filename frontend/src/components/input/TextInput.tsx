interface TextInputProps {
  label: string;
  placeholder: string;
  value: string;
  changeHandler: (evt: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TextInput = ({
  label,
  placeholder,
  value,
  changeHandler,
}: TextInputProps) => (
  <div>
    <label htmlFor="text" className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="mt-1">
      <input
        type="text"
        name="text"
        id="text"
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        placeholder={placeholder}
        value={value}
        onChange={changeHandler}
      />
    </div>
  </div>
);

interface ReasonInputProps {
  placeholder: string;
  textValue: string;
  textChangeHandler: (evt: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ReasonInput = ({
  placeholder,
  textValue,
  textChangeHandler,
}: ReasonInputProps) => (
  <div className="mt-1">
    <input
      type="text"
      name="text"
      id="text"
      className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      placeholder={placeholder}
      value={textValue}
      onChange={textChangeHandler}
    />
  </div>
);

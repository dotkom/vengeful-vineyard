interface AlcoholInputProps {
  type: number;
  amount: number;
  typeInputHandler: (evt: React.ChangeEvent<HTMLSelectElement>) => void;
  amountInputHandler: (evt: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AlcoholInput = ({
  type,
  amount,
  typeInputHandler,
  amountInputHandler,
}: AlcoholInputProps) => (
  <div>
    <div className="relative rounded-md shadow-sm">
      <input
        type="number"
        name="price"
        id="price"
        className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        placeholder="0"
        value={amount.toString()}
        onChange={amountInputHandler}
      />
      <div className="absolute inset-y-0 right-0 flex items-center">
        <label htmlFor="currency" className="sr-only">
          Currency
        </label>
        <select
          id="currency"
          name="currency"
          className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          value={type}
          onChange={typeInputHandler}
        >
          <option value={1}>🍺</option>
          <option value={2}>🍷</option>
        </select>
      </div>
    </div>
  </div>
);

import { Group } from "../../../../helpers/types";

interface AlcoholInputProps {
  type: number;
  amount: number;
  data: Group;
  typeInputHandler: (evt: React.ChangeEvent<HTMLSelectElement>) => void;
  amountInputHandler: (evt: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AlcoholInput = ({
  type,
  amount,
  data,
  typeInputHandler,
  amountInputHandler,
}: AlcoholInputProps) => (
  <div>
    <div className="relative rounded-md shadow-sm">
      <input
        type="number"
        name="price"
        id="price"
        className="block w-full rounded-md border-gray-300 pl-3 pr-12 text-sm focus:border-indigo-500 focus:ring-indigo-500"
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
          className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-sm text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
          value={type}
          onChange={typeInputHandler}
        >
          {data.punishment_types.map((type) => (
            <option
              key={type.punishment_type_id}
              value={type.punishment_type_id}
              title={`Verdi: ${type.value}kr`}
            >
              {type.name} {type.logo_url}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

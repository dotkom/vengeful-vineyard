import { useRef } from "react";

interface ReasonHiddenInputProps {
  reasonHiddenValue: boolean;
  reasonHiddenChangeHandler: (evt: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ReasonHiddenInput = ({
  reasonHiddenValue,
  reasonHiddenChangeHandler,
}: ReasonHiddenInputProps) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div
      tabIndex={0}
      className="flex h-[2.4rem] cursor-pointer flex-row items-center gap-x-2 rounded-md border border-solid border-gray-300 px-3 focus:border-indigo-500 focus:ring-indigo-500"
      onClick={() => ref.current?.click()}
    >
      <input
        tabIndex={-1}
        ref={ref}
        type="checkbox"
        name="reason_hidden"
        id="reason_hidden"
        className="rounded-full border-gray-500 p-2 focus:ring-indigo-500 focus:ring-offset-0"
        onChange={reasonHiddenChangeHandler}
        checked={reasonHiddenValue}
      />
      <span className="text-sm text-gray-500 select-none">Gjem begrunnelse</span>
    </div>
  )
  
};

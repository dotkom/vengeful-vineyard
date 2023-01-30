import reactLogo from "../../assets/react.svg";

export const DebtClock = () => (
  <figure className="flex gap-4 bg-blue-6 p-4 mx-4 mb-16 rounded">
    <img src={reactLogo} className="w-16" />
    <div className="flex flex-col text-white">
      <h1 className="text-4xl font-bold">22 123kr</h1>
      <p>Total gjeld</p>
    </div>
  </figure>
);

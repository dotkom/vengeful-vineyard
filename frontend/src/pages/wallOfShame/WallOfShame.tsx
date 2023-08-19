import { Table } from "../../components/table";

export const WallOfShame = () => (
  <section className="mt-16">
    <h1 className="mb-4 text-center text-xl font-medium">Wall of shame</h1>
    <Table data={undefined} isLoading={true} />
  </section>
);

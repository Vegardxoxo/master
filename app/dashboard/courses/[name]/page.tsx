import { DataTable } from "@/app/ui/courses/table";
import { Payment } from "@/app/lib/definitions";
import { columns } from "@/app/ui/courses/columns";

interface CoursePageProps {
  name: string;
}

async function getData(): Promise<Payment[]> {
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "A@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "AA@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "c@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "b@example.com",
    },
  ];
}

export default async function CoursePage(props: {
  params: Promise<CoursePageProps>;
}) {
  const data = await getData();
  const params = await props.params;
  const name = params.name;

  return (
    <div>
      <h1 className={"text-2xl text-center"}>Course: {name}</h1>
      <div className={"container mx-auto py-10"}>
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}

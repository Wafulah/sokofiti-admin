import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

import { CountyForm } from "./components/county-form";

const CountyPage = async ({ params }: { params: { storeId: string } }) => {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  if (params.storeId !== process.env.NEXT_PUBLIC_ADMIN) {
    redirect("/sign-in");
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CountyForm />
      </div>
    </div>
  );
};

export default CountyPage;

import { AppSidebar, CustomTrigger } from "@/app/ui/dashboard/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/auth";
import {getCourses} from "@/app/lib/database-functions";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user ?? { name: "Guest" };
  const courses = await getCourses();

  return (
    <SidebarProvider>
      <AppSidebar user={user} courses={courses} />
      <main className={"w-full"}>
        <CustomTrigger />
        <div
          className={"flex h-screen flex-col md:flex-row md:overflow-hidden"}
        >
          <div className="flex-grow p-6 md:overflow-y-auto md:p-12 mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}

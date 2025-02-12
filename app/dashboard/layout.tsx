import { AppSidebar, CustomTrigger } from "@/app/ui/dashboard/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className={"w-full"}>
        <CustomTrigger />
        <div className={"flex h-screen flex-col md:flex-row md:overflow-hidden"}>
          <div className="flex-grow p-6 md:overflow-y-auto md:p-12 mx-auto w-full">{children}</div>
        </div>
      </main>
    </SidebarProvider>
  );
}

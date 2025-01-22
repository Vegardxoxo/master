import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import {AppSidebar} from "@/app/ui/dashboard/app-sidebar";

export default function Layout({children}: { children: React.ReactNode }) {
    return (
        <div className={"flex h-screen flex-col md:flex-row md:overflow-hidden"}>
            <div className={"w-full flex-none md:w-64"}>
                <SidebarProvider>
                    <AppSidebar/>
                    <main>
                        <SidebarTrigger/>
                    </main>
                </SidebarProvider>

            </div>
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
        </div>
    )

}


import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import NavLinksCollapse, { NavLinks } from "@/app/ui/dashboard/nav_links";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { ChevronRight, Home, Plus, PlusIcon } from "lucide-react";
import Link from "next/link";
import { PowerIcon } from "@heroicons/react/24/outline";
import AcmeLogo from "@/app/ui/acme-logo";

function AddCourse() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton>
        <Link
          href="/dashboard/courses/add"
          className="flex w-full grow items-center justify-center gap-2 rounded-full bg-blue-600 py-2 px-4 text-sm font-medium
                     text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2
                      focus-visible:outline-blue-600"
        >
          <span className="hidden md:block">Add Course</span>{" "}
          <PlusIcon className="h-5 md:ml-4" />
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
          href="/"
        >
          <div className="w-32 text-white md:w-40">
            <AcmeLogo />
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavLinks />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                <p className={"text-sm font-medium md:justify-start"}>
                  My Courses
                </p>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavLinksCollapse />
                  <AddCourse />
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter>
        <form>
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}

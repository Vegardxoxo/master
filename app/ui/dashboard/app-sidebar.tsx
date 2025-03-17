"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Courses, NavLinks } from "@/app/ui/dashboard/nav_links";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { ChevronRight, PanelRightOpen, PlusIcon } from "lucide-react";
import Link from "next/link";
import { PowerIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserProfile from "@/app/ui/user-profile";
import { usePathname } from "next/navigation";
import {handleSignOut} from "@/app/lib/server-actions/actions";
import {UserCourse} from "@/app/lib/definitions";

function AddCourseButton() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={false} asChild>
        <Button
          asChild
          variant="default"
          className="rounded-xl bg-sky-500 w-full md:w-auto"
        >
          <Link
            href="/dashboard/courses/add"
            className="hover:bg-sky-500 hover:text-white"
          >
            Add Course
            <PlusIcon className="h-5 w-5 md:ml-2" />
          </Link>
        </Button>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ user, courses }: { user: any; courses: UserCourse[] }) {
  return (
    <Sidebar collapsible="offcanvas">
      {/*Header*/}
      <div className="flex flex-col h-full">
        <SidebarHeader className="flex-shrink-0">
          <Link
            className="flex flex-col h-20 items-start justify-start rounded-md bg-sky-500 p-0"
            href="/dashboard"
          >
            <div className="w-full text-white">
              <UserProfile user={user} />
            </div>
          </Link>
        </SidebarHeader>

        {/*Main navigation*/}
        <div className="flex-1 overflow-y-auto">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavLinks />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/*Courses*/}
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center px-2 py-1.5">
                    <span className="text-sm font-medium">My Courses</span>
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <Courses
                        courses={courses}
                      />
                      <AddCourseButton />
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          </SidebarContent>
        </div>
        {/*Footer*/}
        <SidebarFooter className="flex-shrink-0">
          <form action={() => handleSignOut()}>
            <button className="flex h-10 w-full items-center gap-2 rounded-md p-2 text-sm font-medium hover:bg-sky-100 hover:text-blue-600">
              <PowerIcon className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}

export function CustomTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" className="fixed" onClick={toggleSidebar}>
            <PanelRightOpen size={60} />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-sky-500" side="right" align="center">
          <p className="font-medium text-sm text-white">
            Toggle Sidebar (Ctrl+B)
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

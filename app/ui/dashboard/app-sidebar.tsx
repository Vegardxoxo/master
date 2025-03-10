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
import  { NavLinks } from "@/app/ui/dashboard/nav_links";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { ChevronRight, PanelRightOpen, PlusIcon } from "lucide-react";
import Link from "next/link";
import { PowerIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { cn } from "@/app/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { handleSignOut } from "@/app/lib/actions";
import UserProfile from "@/app/ui/user-profile";
import {usePathname} from "next/navigation";
import Courses from "@/app/ui/courses/course";

function AddCourse() {
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
            className={" hover:bg-sky-500 hover:text-white"}
          >
            Add Course
            <PlusIcon className="h-5 w-5 md:ml-2" />
          </Link>
        </Button>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ user, courses }: { user: any, courses: any }) {
  const pathName = usePathname();
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <Link
          className="flex flex-col h-20 md:h-40 items-start justify-start md:justify-center rounded-md bg-sky-500 p-0"
          href="/dashboard"
        >
          <div className="w-full text-white">
            <UserProfile user={user} />
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
        <Collapsible defaultOpen={false} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                <p className={"text-sm font-medium md:justify-start"}>
                  My Courses
                </p>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent
              className={cn(
                "text-popover-foreground outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
              )}
            >
              <SidebarGroupContent>
                <SidebarMenu>
                  <Courses pathName={pathName} courses={courses} />
                  <AddCourse />
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter>
        <form action={handleSignOut}>
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}

export function CustomTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" className="fixed " onClick={toggleSidebar}>
            <PanelRightOpen size={60} onClick={toggleSidebar} />
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

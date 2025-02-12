"use client"
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
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import NavLinksCollapse, { NavLinks } from "@/app/ui/dashboard/nav_links"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible"
import { ChevronRight, PanelRightOpen, PlusIcon } from "lucide-react"
import Link from "next/link"
import { PowerIcon } from "@heroicons/react/24/outline"
import AcmeLogo from "@/app/ui/acme-logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/app/lib/utils"

function AddCourse() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={false} asChild>
        <Button asChild variant="default" className="rounded-xl bg-sky-500 w-full md:w-auto">
          <Link href="/dashboard/courses/add" className={" hover:bg-sky-500 hover:text-white"}>
            Add Course
            <PlusIcon className="h-5 w-5 md:ml-2" />
          </Link>
        </Button>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function AppSidebar() {
  return (
    <Sidebar collapsible="dismissible">
      <SidebarHeader>
        <Link className="mb-2 flex h-20 items-end justify-start rounded-md bg-sky-500 p-4 md:h-40" href="/">
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
        <Collapsible defaultOpen={false} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                <p className={"text-sm font-medium md:justify-start"}>My Courses</p>
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
  )
}

export function CustomTrigger() {
  const { toggleSidebar } = useSidebar()

  return (
    <Button variant="ghost" size="icon" className="" onClick={toggleSidebar} disabled={false}>
      <PanelRightOpen className="h-10 w-10" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

export default function SideBar() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <CustomTrigger />
      </main>
    </SidebarProvider>
  )
}


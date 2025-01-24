"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { links, courses } from "@/app/lib/placeholder-data";

/**
 * Non-collapsable links to be rendered in side-nav.-
 */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        return (
          <SidebarMenuItem key={link.name}>
            <SidebarMenuButton asChild>
              <Link
                href={link.href}
                className={clsx(
                  "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
                  {
                    "bg-sky-100 text-blue-600": link.href == pathname,
                  },
                )}
              >
                <link.icon />
                <p className="hidden md:block">{link.name}</p>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}

/**
 * Collapsable links to be rendered in side-nav.
 * @constructor
 */
export default function NavLinksCollapse() {
  const pathname = usePathname();
  return (
    <>
      {courses.map((link) => {
        const linkPath = `/dashboard/courses/${link.slug}`;
        return (
          <SidebarMenuItem key={link.name}>
            <SidebarMenuButton asChild>
              <Link
                href={linkPath}
                className={clsx(
                  "flex h-[48px] grow items-center justify-middle pl-5 gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:pl-5 md:p-2 md:px-3",
                  {
                    "bg-sky-100 text-blue-600": pathname === linkPath,
                  },
                )}
              >
                <p className="text-center">{link.name}</p>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}
